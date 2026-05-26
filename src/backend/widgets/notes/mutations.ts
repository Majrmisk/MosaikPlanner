"use server"

import {revalidatePath} from "next/cache";
import {getWidgetById, updateWidget, updateWidgetData} from "@/modules/widgets/repository";
import {getDashboardItemByUserIdAndWidgetId} from "@/modules/dashboard/repository";
import {getCurrentUserId} from "@/backend/actions";
import {updateNoteFormSchema} from "@/modules/widgets/components/notes/schema";

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