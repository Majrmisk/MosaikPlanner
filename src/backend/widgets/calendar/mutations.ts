'use server';

import {getCurrentUserId} from "@/backend/queries";
import {updateCalendarFormSchema} from "@/modules/widgets/components/calendar/schema";
import {getWidgetById, updateWidget, updateWidgetData} from "@/modules/widgets/repository";
import {getDashboardItemByUserIdAndWidgetId} from "@/modules/dashboard/repository";
import {revalidatePath} from "next/cache";

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
