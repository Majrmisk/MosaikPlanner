import 'server-only';

import { eq } from 'drizzle-orm';
import { db, widgetDataTable, widgetsTable } from '@/lib/db';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { WidgetData as WidgetDataRecord } from '@/lib/db/schemas/widget-data';
import type {
    CreateWidgetDataInput,
    CreateWidgetInput,
    UpdateWidgetDataInput,
    UpdateWidgetInput,
} from './schemas';

export const getWidgetById = async (widgetId: string): Promise<WidgetRecord | undefined> => {
    return db.query.widgetsTable.findFirst({
        where: (table, { eq }) => eq(table.id, widgetId),
    });
};

export const getWidgetDataById = async (
    widgetDataId: string,
): Promise<WidgetDataRecord | undefined> => {
    return db.query.widgetDataTable.findFirst({
        where: (table, { eq }) => eq(table.id, widgetDataId),
    });
};

export const createWidget = async (data: CreateWidgetInput): Promise<WidgetRecord> => {
    const [widget] = await db.insert(widgetsTable).values(data).returning();

    if (!widget) {
        throw new Error('Failed to create widget');
    }

    return widget;
};

export const createWidgetData = async (
    data: CreateWidgetDataInput,
): Promise<WidgetDataRecord> => {
    const [widgetData] = await db.insert(widgetDataTable).values(data).returning();

    if (!widgetData) {
        throw new Error('Failed to create widget data');
    }

    return widgetData;
};

export const updateWidget = async (
    widgetId: string,
    data: UpdateWidgetInput,
): Promise<WidgetRecord> => {
    const [widget] = await db
        .update(widgetsTable)
        .set(data)
        .where(eq(widgetsTable.id, widgetId))
        .returning();

    if (!widget) {
        throw new Error('Failed to update widget');
    }

    return widget;
};

export const updateWidgetData = async (
    widgetDataId: string,
    data: UpdateWidgetDataInput,
): Promise<WidgetDataRecord> => {
    const [widgetData] = await db
        .update(widgetDataTable)
        .set(data)
        .where(eq(widgetDataTable.id, widgetDataId))
        .returning();

    if (!widgetData) {
        throw new Error('Failed to update widget data');
    }

    return widgetData;
};

export const deleteWidget = async (widgetId: string): Promise<WidgetRecord | undefined> => {
    const [widget] = await db
        .delete(widgetsTable)
        .where(eq(widgetsTable.id, widgetId))
        .returning();

    return widget;
};

export const deleteWidgetData = async (
    widgetDataId: string,
): Promise<WidgetDataRecord | undefined> => {
    const [widgetData] = await db
        .delete(widgetDataTable)
        .where(eq(widgetDataTable.id, widgetDataId))
        .returning();

    return widgetData;
};
