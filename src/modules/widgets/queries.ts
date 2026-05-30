import 'server-only';

import { db, widgetsTable, dashboardItemsTable, widgetDataTable } from '@/lib/db';
import { groupMembersTable } from '@/lib/db/schemas/groups';
import { eq, and, notInArray, inArray, ne } from 'drizzle-orm';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import {
    notesDataSchema,
    expensesDataSchema,
    spinnerDataSchema,
    calendarDataSchema,
    checklistDataSchema,
    type ParsedWidgetData,
} from './schemas';

export type { ParsedWidgetData };

const safeJsonParse = (str: string): unknown => {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
};

export const parseExpensesData = (rawData: string): ParsedWidgetData => {
    const result = expensesDataSchema.safeParse(safeJsonParse(rawData));
    return result.success ? { widgetType: 'expenses', data: result.data } : null;
};

export const parseNotesData = (rawData: string): ParsedWidgetData => {
    const result = notesDataSchema.safeParse(safeJsonParse(rawData));
    return result.success ? { widgetType: 'notes', data: result.data } : null;
};

export const parseSpinnerData = (rawData: string): ParsedWidgetData => {
    const result = spinnerDataSchema.safeParse(safeJsonParse(rawData));
    return result.success ? { widgetType: 'spinner', data: result.data } : null;
};

export const parseCalendarData = (rawData: string): ParsedWidgetData => {
    const result = calendarDataSchema.safeParse(safeJsonParse(rawData));
    return result.success ? { widgetType: 'calendar', data: result.data } : null;
};

export const parseChecklistData = (rawData: string): ParsedWidgetData => {
    const result = checklistDataSchema.safeParse(safeJsonParse(rawData));
    return result.success ? { widgetType: 'checklist', data: result.data } : null;
};

export const parseWidgetData = (type: string, rawData: string): ParsedWidgetData => {
    switch (type) {
        case 'notes':
            return parseNotesData(rawData);
        case 'expenses':
            return parseExpensesData(rawData);
        case 'spinner':
            return parseSpinnerData(rawData);
        case 'calendar':
            return parseCalendarData(rawData);
        case 'checklist':
            return parseChecklistData(rawData);
        default:
            return null;
    }
};

export type ParsedChildWidget = {
    widget: WidgetRecord;
    parsedData: ParsedWidgetData;
};

const mapToParsedChildWidgets = (
    rows: { widget: WidgetRecord; widgetData: { data: string } }[],
): ParsedChildWidget[] =>
    rows.map(({ widget, widgetData }) => ({
        widget,
        parsedData: parseWidgetData(widget.type, widgetData.data),
    }));

export const getCalendarChildWidgets = async (
    widgetId: string,
    userId: string,
): Promise<ParsedChildWidget[]> => {
    const widget = await db.query.widgetsTable.findFirst({
        where: (table, { eq }) => eq(table.id, widgetId),
    });

    if (!widget) return [];

    const childTypes = ['checklist', 'spinner'] as const;

    if (widget.visibility === 'group' && widget.groupId) {
        const rows = await db
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
        return mapToParsedChildWidgets(rows);
    }

    const userWidgetIds = db
        .select({ widgetId: dashboardItemsTable.widgetId })
        .from(dashboardItemsTable)
        .where(eq(dashboardItemsTable.userId, userId));

    const rows = await db
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
    return mapToParsedChildWidgets(rows);
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
