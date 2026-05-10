'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import {
    updateNoteFormSchema,
    updateChecklistFormSchema,
    updateCalendarFormSchema,
} from './schemas';
import { getWidgetById, updateWidget, updateWidgetData } from './repository';
import { getDashboardItemByUserIdAndWidgetId } from '@/modules/dashboard/repository';

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