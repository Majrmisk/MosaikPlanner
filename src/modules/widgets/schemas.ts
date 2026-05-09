import { z } from 'zod';
import type { WidgetType, WidgetVisibility } from '@/lib/db/schemas/widgets';
import { groupIdSchema } from '@/modules/groups/schemas';

const idSchema = z.uuid();

export const widgetIdSchema = idSchema;
export const widgetDataIdSchema = idSchema;
export const widgetNameSchema = z.string().trim().min(1).max(100);
export const widgetTypeSchema = z.enum(['notes', 'calendar', 'checklist', 'spinner', 'expenses']);
export const widgetVisibilitySchema = z.enum(['private', 'group']);
export const widgetDataContentSchema = z.string().min(1);

export const createWidgetFormSchema = z.object({
    name: widgetNameSchema,
    type: widgetTypeSchema,
    visibility: widgetVisibilitySchema,
    groupId: groupIdSchema.nullable(),
});

export const createNoteFormSchema = z.object({
    name: widgetNameSchema,
});

export const updateNoteFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    content: z.string(),
});

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

export const calendarManualEventSchema = z.object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    date: z.iso.date(),
});

export const updateCalendarFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    excludedWidgetIds: z.array(z.uuid()),
    manualEvents: z.array(calendarManualEventSchema),
    widgetColors: z.record(z.string(), z.string()),
});

export type CalendarManualEvent = z.infer<typeof calendarManualEventSchema>;

export const updateExpenseFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    expenses: z.array(
        z.object({
            id: z.uuidv4(),
            name: z.string().trim().min(1, 'Expense title is required').max(200),
            price: z.number().positive('Price must be > 0'),
            payedBy: z.uuidv4(),
            payedFor: z.array(z.uuidv4()).min(0, 'At least one person must be selected'),
            payedAt: z.date('v update expected'),
        }),
    ),
});

export type CreateWidgetFormInput = z.infer<typeof createWidgetFormSchema>;
export type CreateNoteFormInput = z.infer<typeof createNoteFormSchema>;
export type UpdateNoteFormInput = z.infer<typeof updateNoteFormSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type UpdateChecklistFormInput = z.infer<typeof updateChecklistFormSchema>;

export const widgetDataSchema = z.object({
    id: widgetDataIdSchema,
    data: widgetDataContentSchema,
});

export const createWidgetDataSchema = z.object({
    data: widgetDataContentSchema,
});

export const updateWidgetDataSchema = z.object({
    data: widgetDataContentSchema,
});

export const widgetSchema = z.object({
    id: widgetIdSchema,
    groupId: groupIdSchema.nullable(),
    name: widgetNameSchema,
    type: widgetTypeSchema,
    visibility: widgetVisibilitySchema,
    dataId: widgetDataIdSchema,
});

export const createWidgetSchema = z.object({
    groupId: groupIdSchema.nullable(),
    name: widgetNameSchema,
    type: widgetTypeSchema,
    visibility: widgetVisibilitySchema,
    dataId: widgetDataIdSchema,
});

export const updateWidgetSchema = z.object({
    groupId: groupIdSchema.nullable().optional(),
    name: widgetNameSchema.optional(),
    type: widgetTypeSchema.optional(),
    visibility: widgetVisibilitySchema.optional(),
    dataId: widgetDataIdSchema.optional(),
});

export type Widget = z.infer<typeof widgetSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;

export type WidgetData = z.infer<typeof widgetDataSchema>;
export type CreateWidgetDataInput = z.infer<typeof createWidgetDataSchema>;
export type UpdateWidgetDataInput = z.infer<typeof updateWidgetDataSchema>;

export type { WidgetType, WidgetVisibility };

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
