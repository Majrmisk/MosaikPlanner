'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { createWidgetFormSchema, widgetIdSchema } from '@/modules/widgets/schemas';
import { z } from 'zod';
import { dashboardItemIdSchema, dashboardItemOrderIndexSchema } from './schemas';
import {
    createWidgetData,
    createWidget,
    getWidgetById,
    deleteWidget,
} from '@/modules/widgets/repository';
import {
    addWidgetToDashboard,
    getMaxOrderIndex,
    getDashboardItemById,
    getDashboardItemByUserIdAndWidgetId,
    removeDashboardItem,
    reorderDashboardItems,
} from './repository';

const getCurrentUserId = async (): Promise<string> => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    return userId;
};

export const createWidgetAction = async (input: {
    name: string;
    type: string;
    visibility: string;
    groupId: string | null;
}) => {
    const userId = await getCurrentUserId();
    const { name, type, visibility, groupId } = createWidgetFormSchema.parse(input);

    const initialData: Record<string, string> = {
        notes: JSON.stringify({ content: '' }),
        spinner: JSON.stringify({
            items: [],
            currentIndex: 0,
            intervalDays: null,
            lastTriggered: null,
        }),
        // TODO: calendar: JSON.stringify...
        // TODO: checklist: JSON.stringify...
        // TODO: expenses: JSON.stringify...
    };

    const widgetData = await createWidgetData({
        data: initialData[type] ?? JSON.stringify({}),
    });

    const widget = await createWidget({
        name,
        type,
        visibility,
        groupId,
        dataId: widgetData.id,
    });

    const maxOrder = await getMaxOrderIndex(userId);
    await addWidgetToDashboard(userId, widget.id, maxOrder + 1);

    revalidatePath('/dashboard');
};

export const addExistingWidgetAction = async (widgetId: string) => {
    const userId = await getCurrentUserId();
    const validatedId = widgetIdSchema.parse(widgetId);

    const widget = await getWidgetById(validatedId);
    if (!widget) {
        throw new Error('Widget not found');
    }

    const existing = await getDashboardItemByUserIdAndWidgetId(userId, validatedId);
    if (existing) {
        throw new Error('Widget is already on your dashboard');
    }

    const lastIndex = await getMaxOrderIndex(userId);
    await addWidgetToDashboard(userId, validatedId, lastIndex + 1);

    revalidatePath('/dashboard');
};

export const removeWidgetFromDashboardAction = async (dashboardItemId: string) => {
    const userId = await getCurrentUserId();
    const validatedId = dashboardItemIdSchema.parse(dashboardItemId);

    const dashboardItem = await getDashboardItemById(validatedId);
    if (!dashboardItem || dashboardItem.userId !== userId) {
        throw new Error('Dashboard item not found');
    }

    await removeDashboardItem(validatedId);
    // Remove group widgets only from the user's dashboard,
    // do not delete them, that should be handled elsewhere.
    // - either right in the group page or when the last member removes it from their dashboard
    // Private widgets get deleted here.
    const widget = await getWidgetById(dashboardItem.widgetId);
    if (widget?.visibility === 'private') {
        await deleteWidget(widget.id);
    }

    revalidatePath('/dashboard');
};

const reorderItemSchema = z.object({
    id: dashboardItemIdSchema,
    orderIndex: dashboardItemOrderIndexSchema,
});

export const reorderWidgetsAction = async (items: { id: string; orderIndex: number }[]) => {
    const userId = await getCurrentUserId();
    const validated = z.array(reorderItemSchema).min(1).parse(items);

    for (const item of validated) {
        const dashboardItem = await getDashboardItemById(item.id);
        if (!dashboardItem || dashboardItem.userId !== userId) {
            throw new Error('Dashboard item not found');
        }
    }

    await reorderDashboardItems(validated);
    revalidatePath('/dashboard');
};
