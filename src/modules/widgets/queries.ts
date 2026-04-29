import 'server-only';

import { db, widgetsTable, dashboardItemsTable } from '@/lib/db';
import { groupMembersTable } from '@/lib/db/schemas/groups';
import { eq, and, notInArray, inArray } from 'drizzle-orm';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';

export const getAvailableGroupWidgetsForUser = async (
    userId: string,
): Promise<WidgetRecord[]> => {
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
