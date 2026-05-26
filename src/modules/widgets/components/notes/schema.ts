import {z} from "zod";
import {widgetIdSchema, widgetNameSchema} from "@/modules/widgets/schemas";

export const noteFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    content: z.string(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const createNoteFormSchema = z.object({
    name: widgetNameSchema,
});

export const updateNoteFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    content: z.string(),
});

export type CreateNoteFormInput = z.infer<typeof createNoteFormSchema>;
export type UpdateNoteFormInput = z.infer<typeof updateNoteFormSchema>;