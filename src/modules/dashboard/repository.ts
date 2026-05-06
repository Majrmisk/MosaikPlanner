import 'server-only';

import { and, asc, count, eq, inArray, max } from 'drizzle-orm';
import { dashboardItemsTable, db, widgetDataTable, widgetsTable } from '@/lib/db';
import type { DashboardItem as DashboardItemRecord } from '@/lib/db/schemas/dashboard-items';
import type { DashboardWidget } from './schemas';

export const getDashboardWidgetsByUserId = async (userId: string): Promise<DashboardWidget[]> => {
    const rows = await db
        .select({
            id: dashboardItemsTable.id,
            userId: dashboardItemsTable.userId,
            widgetId: dashboardItemsTable.widgetId,
            orderIndex: dashboardItemsTable.orderIndex,
            widgetGroupId: widgetsTable.groupId,
            widgetName: widgetsTable.name,
            widgetType: widgetsTable.type,
            widgetVisibility: widgetsTable.visibility,
            widgetDataId: widgetsTable.dataId,
            widgetData: widgetDataTable.data,
        })
        .from(dashboardItemsTable)
        .innerJoin(widgetsTable, eq(dashboardItemsTable.widgetId, widgetsTable.id))
        .innerJoin(widgetDataTable, eq(widgetsTable.dataId, widgetDataTable.id))
        .where(eq(dashboardItemsTable.userId, userId))
        .orderBy(asc(dashboardItemsTable.orderIndex));

    return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        widgetId: row.widgetId,
        orderIndex: row.orderIndex,
        widget: {
            id: row.widgetId,
            groupId: row.widgetGroupId,
            name: row.widgetName,
            type: row.widgetType,
            visibility: row.widgetVisibility,
            dataId: row.widgetDataId,
            data: {
                id: row.widgetDataId,
                data: row.widgetData,
            },
        },
    }));
};

export const getDashboardItemByUserIdAndWidgetId = async (
    userId: string,
    widgetId: string,
): Promise<DashboardItemRecord | undefined> => {
    return db.query.dashboardItemsTable.findFirst({
        where: (table, { and, eq }) => and(eq(table.userId, userId), eq(table.widgetId, widgetId)),
    });
};

export const getDashboardItemById = async (
    id: string,
): Promise<DashboardItemRecord | undefined> => {
    return db.query.dashboardItemsTable.findFirst({
        where: (table, { eq }) => eq(table.id, id),
    });
};

export const getMaxOrderIndex = async (userId: string): Promise<number> => {
    const [result] = await db
        .select({ maxOrder: max(dashboardItemsTable.orderIndex) })
        .from(dashboardItemsTable)
        .where(eq(dashboardItemsTable.userId, userId));

    return result?.maxOrder ?? -1;
};

export const addWidgetToDashboard = async (
    userId: string,
    widgetId: string,
    orderIndex: number,
): Promise<DashboardItemRecord> => {
    const [item] = await db
        .insert(dashboardItemsTable)
        .values({ userId, widgetId, orderIndex })
        .returning();

    if (!item) {
        throw new Error('Failed to add widget to dashboard');
    }

    return item;
};

export const removeDashboardItem = async (
    dashboardItemId: string,
): Promise<DashboardItemRecord | undefined> => {
    const [item] = await db
        .delete(dashboardItemsTable)
        .where(eq(dashboardItemsTable.id, dashboardItemId))
        .returning();

    return item;
};

export const reorderDashboardItems = async (
    items: { id: string; orderIndex: number }[],
): Promise<void> => {
    for (const item of items) {
        await db
            .update(dashboardItemsTable)
            .set({ orderIndex: item.orderIndex })
            .where(eq(dashboardItemsTable.id, item.id));
    }
};

export const getDashboardItemCountByWidgetId = async (widgetId: string): Promise<number> => {
    const [result] = await db
        .select({ count: count() })
        .from(dashboardItemsTable)
        .where(eq(dashboardItemsTable.widgetId, widgetId));

    return result?.count ?? 0;
};

// Remove all of a group's widgets from a user's dashboard once they leave that group
export const removeGroupWidgetsFromUserDashboard = async (
    userId: string,
    groupId: string,
): Promise<string[]> => {
    const widgetIds = await db
        .select({ id: widgetsTable.id })
        .from(widgetsTable)
        .where(eq(widgetsTable.groupId, groupId));

    if (widgetIds.length === 0) return [];

    await db.delete(dashboardItemsTable).where(
        and(
            eq(dashboardItemsTable.userId, userId),
            inArray(
                dashboardItemsTable.widgetId,
                widgetIds.map((w) => w.id),
            ),
        ),
    );

    return widgetIds.map((w) => w.id);
};
