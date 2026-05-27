'use server';

import {getCurrentUserId} from "@/backend/queries";
import {updateChecklistFormSchema} from "@/modules/widgets/components/checklist/schema";
import {getWidgetById, updateWidget, updateWidgetData} from "@/modules/widgets/repository";
import {getDashboardItemByUserIdAndWidgetId} from "@/modules/dashboard/repository";
import {revalidatePath} from "next/cache";

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
