import 'server-only';

import { db, widgetsTable, dashboardItemsTable, widgetDataTable } from '@/lib/db';
import { groupMembersTable } from '@/lib/db/schemas/groups';
import { eq, and, notInArray, inArray, ne } from 'drizzle-orm';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { WidgetData as WidgetDataRecord } from '@/lib/db/schemas/widget-data';

export type ChildWidget = {
    widget: WidgetRecord;
    widgetData: WidgetDataRecord;
};

export const getCalendarChildWidgets = async (
    widgetId: string,
    userId: string,
): Promise<ChildWidget[]> => {
    const widget = await db.query.widgetsTable.findFirst({
        where: (table, { eq }) => eq(table.id, widgetId),
    });

    if (!widget) return [];

    const childTypes = ['checklist', 'spinner'] as const;

    if (widget.visibility === 'group' && widget.groupId) {
        return db
            .select({ widget: widgetsTable, widgetData: widgetDataTable })
            .from(widgetsTable)
            .innerJoin(widgetDataTable, eq(widgetsTable.dataId, widgetDataTable.id))
            .where(
                and(
                    eq(widgetsTable.groupId, widget.groupId),
                    inArray(widgetsTable.type, [...childTypes]),
                    ne(widgetsTable.id, widgetId),
                ),
            );
    }

    const userWidgetIds = db
        .select({ widgetId: dashboardItemsTable.widgetId })
        .from(dashboardItemsTable)
        .where(eq(dashboardItemsTable.userId, userId));

    return db
        .select({ widget: widgetsTable, widgetData: widgetDataTable })
        .from(widgetsTable)
        .innerJoin(widgetDataTable, eq(widgetsTable.dataId, widgetDataTable.id))
        .where(
            and(
                eq(widgetsTable.visibility, 'private'),
                inArray(widgetsTable.id, userWidgetIds),
                inArray(widgetsTable.type, [...childTypes]),
                ne(widgetsTable.id, widgetId),
            ),
        );
};

export const getAvailableGroupWidgetsForUser = async (userId: string): Promise<WidgetRecord[]> => {
    const userDashboardWidgetIds = db
        .select({ widgetId: dashboardItemsTable.widgetId })
        .from(dashboardItemsTable)
        .where(eq(dashboardItemsTable.userId, userId));

    const userGroupIds = db
        .select({ groupId: groupMembersTable.groupId })
        .from(groupMembersTable)
        .where(eq(groupMembersTable.userId, userId));

    return db
        .select()
        .from(widgetsTable)
        .where(
            and(
                eq(widgetsTable.visibility, 'group'),
                inArray(widgetsTable.groupId, userGroupIds),
                notInArray(widgetsTable.id, userDashboardWidgetIds),
            ),
        );
};