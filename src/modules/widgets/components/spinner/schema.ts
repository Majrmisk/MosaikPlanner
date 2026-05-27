import {widgetIdSchema} from "@/modules/widgets/schemas";
import {z} from "zod";

export const updateSpinnerFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    items: z.array(z.string().trim().min(1).max(200)).min(1),
    intervalDays: z.number().int().positive().nullable(),
});

export const advanceSpinnerSchema = z.object({
    widgetId: widgetIdSchema,
});

export type UpdateSpinnerFormInput = z.infer<typeof updateSpinnerFormSchema>;

export type SpinnerData = {
    items: string[];
    currentIndex: number;
    intervalDays: number | null;
    lastTriggered: string;
};