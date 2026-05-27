'use server';

import {Expense, updateExpenseFormSchema} from "@/modules/widgets/components/expenses/schema";
import {getCurrentUserId} from "@/backend/queries";
import {getWidgetById, updateWidget, updateWidgetData} from "@/modules/widgets/repository";
import {getDashboardItemByUserIdAndWidgetId} from "@/modules/dashboard/repository";
import {revalidatePath} from "next/cache";

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