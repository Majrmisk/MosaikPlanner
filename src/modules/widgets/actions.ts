'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import {
    updateNoteFormSchema,
    updateChecklistFormSchema,
    updateCalendarFormSchema,
    updateSpinnerFormSchema,
    advanceSpinnerSchema,
    updateExpenseFormSchema
} from './schemas';
import { getWidgetById, getWidgetDataById, updateWidget, updateWidgetData } from './repository';
import { getDashboardItemByUserIdAndWidgetId } from '@/modules/dashboard/repository';
import {Expense} from "@/modules/widgets/components/expenses";

const getCurrentUserId = async (): Promise<string> => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    return userId;
};

export const updateNoteWidgetAction = async (input: {
    widgetId: string;
    title: string;
    content: string;
}) => {
    const userId = await getCurrentUserId();
    const { widgetId, title, content } = updateNoteFormSchema.parse(input);

    const widget = await getWidgetById(widgetId);
    if (!widget) {
        throw new Error('Widget not found');
    }

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(userId, widgetId);
        if (!dashboardItem) {
            throw new Error('Widget not found');
        }
    }

    await updateWidgetData(widget.dataId, {
        data: JSON.stringify({ content }),
    });

    await updateWidget(widgetId, { name: title });

    revalidatePath('/dashboard');
    revalidatePath(`/widgets/${widgetId}`);
};

export const updateExpensesWidgetAction = async (input: {
    widgetId: string;
    title: string;
    expenses: Expense[];
}) => {
    const userId = await getCurrentUserId();
    const { widgetId, title, expenses } = updateExpenseFormSchema.parse(input);

    const widget = await getWidgetById(widgetId);
    if (!widget) {
        throw new Error('Widget not found');
    }

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(userId, widgetId);
        if (!dashboardItem) {
            throw new Error('Widget not found');
        }
    }

    await updateWidgetData(widget.dataId, {
        data: JSON.stringify({ expenses }),
    });

    await updateWidget(widgetId, { name: title });

    revalidatePath('/dashboard');
    revalidatePath(`/widgets/${widgetId}`);
};

export const updateSpinnerWidgetAction = async (input: {
    widgetId: string;
    title: string;
    items: string[];
    intervalDays: number | null;
    lastTriggered: string | null;
}) => {
    const userId = await getCurrentUserId();
    const { widgetId, title, items, intervalDays } = updateSpinnerFormSchema.parse(input);

    const widget = await getWidgetById(widgetId);
    if (!widget) throw new Error('Widget not found');

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(userId, widgetId);
        if (!dashboardItem) throw new Error('Widget not found');
    }

    const currentData = await getWidgetDataById(widget.dataId);
    let currentIndex = 0;
    let lastTriggered: string | null = null;
    try {
        const parsed = JSON.parse(currentData?.data ?? '{}') as {
            currentIndex?: number;
            lastTriggered?: string | null;
        };
        currentIndex = Math.min(parsed.currentIndex ?? 0, items.length - 1);
        lastTriggered = parsed.lastTriggered ?? null;
    } catch {}

    if (intervalDays) {
        lastTriggered = new Date().toISOString().split('T')[0];
    }

    await updateWidgetData(widget.dataId, {
        data: JSON.stringify({ items, currentIndex, intervalDays, lastTriggered }),
    });

    await updateWidget(widgetId, { name: title });

    revalidatePath('/dashboard');
    revalidatePath(`/widgets/${widgetId}`);
};

export const updateChecklistWidgetAction = async (input: {
    widgetId: string;
    title: string;
    items: { id: string; text: string; completed: boolean; dueDate: string | null }[];
}) => {
    const userId = await getCurrentUserId();
    const { widgetId, title, items } = updateChecklistFormSchema.parse(input);

    const widget = await getWidgetById(widgetId);
    if (!widget) {
        throw new Error('Widget not found');
    }

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(userId, widgetId);
        if (!dashboardItem) {
            throw new Error('Widget not found');
        }
    }

    await updateWidgetData(widget.dataId, {
        data: JSON.stringify({ items }),
    });

    await updateWidget(widgetId, { name: title });

    revalidatePath('/dashboard');
    revalidatePath(`/widgets/${widgetId}`);
};

export const advanceSpinnerAction = async (input: { widgetId: string }) => {
    const userId = await getCurrentUserId();
    const { widgetId } = advanceSpinnerSchema.parse(input);

    const widget = await getWidgetById(widgetId);
    if (!widget) throw new Error('Widget not found');

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(userId, widgetId);
        if (!dashboardItem) throw new Error('Widget not found');
    }

    const currentData = await getWidgetDataById(widget.dataId);
    let items: string[] = [];
    let currentIndex = 0;
    let intervalDays: number | null = null;
    try {
        const parsed = JSON.parse(currentData?.data ?? '{}') as {
            items?: string[];
            currentIndex?: number;
            intervalDays?: number | null;
        };
        items = parsed.items ?? [];
        currentIndex = parsed.currentIndex ?? 0;
        intervalDays = parsed.intervalDays ?? null;
    } catch {}

    if (items.length === 0) throw new Error('No items');

    const newIndex = (currentIndex + 1) % items.length;
    const lastTriggered = new Date().toISOString().split('T')[0];

    await updateWidgetData(widget.dataId, {
        data: JSON.stringify({ items, currentIndex: newIndex, intervalDays, lastTriggered }),
    });

    revalidatePath('/dashboard');
};

export const updateCalendarWidgetAction = async (input: {
    widgetId: string;
    title: string;
    excludedWidgetIds: string[];
    manualEvents: { id: string; title: string; date: string }[];
    widgetColors: Record<string, string>;
}) => {
    const userId = await getCurrentUserId();
    const { widgetId, title, excludedWidgetIds, manualEvents, widgetColors } =
        updateCalendarFormSchema.parse(input);

    const widget = await getWidgetById(widgetId);
    if (!widget) {
        throw new Error('Widget not found');
    }

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(userId, widgetId);
        if (!dashboardItem) {
            throw new Error('Widget not found');
        }
    }

    await updateWidgetData(widget.dataId, {
        data: JSON.stringify({ excludedWidgetIds, manualEvents, widgetColors }),
    });

    await updateWidget(widgetId, { name: title });

    revalidatePath('/dashboard');
    revalidatePath(`/widgets/${widgetId}`);
};
