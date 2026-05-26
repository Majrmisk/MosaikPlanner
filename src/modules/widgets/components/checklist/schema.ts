import {widgetIdSchema} from "@/modules/widgets/schemas";
import {z} from "zod";

export const checklistItemSchema = z.object({
    id: z.uuid(),
    text: z.string().trim().min(1).max(500),
    completed: z.boolean(),
    dueDate: z.iso.date().nullable(),
});

export const updateChecklistFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    items: z.array(checklistItemSchema),
});

export const checklistFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    items: z.array(
        z.object({
            id: z.uuid(),
            text: z.string().trim().min(1, 'Item text is required').max(500),
            completed: z.boolean(),
            dueDate: z.iso.date().nullable(),
        }),
    ),
});

export type ChecklistFormValues = z.infer<typeof checklistFormSchema>;

export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export type UpdateChecklistFormInput = z.infer<typeof updateChecklistFormSchema>;
