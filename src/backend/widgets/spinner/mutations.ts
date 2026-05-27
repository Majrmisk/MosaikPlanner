'use server';

import {getCurrentUserId} from "@/backend/queries";
import {getWidgetById, getWidgetDataById, updateWidget, updateWidgetData} from "@/modules/widgets/repository";
import {getDashboardItemByUserIdAndWidgetId} from "@/modules/dashboard/repository";
import {revalidatePath} from "next/cache";
import {advanceSpinnerSchema, updateSpinnerFormSchema} from "@/modules/widgets/components/spinner/schema";

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