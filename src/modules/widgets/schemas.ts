import { z } from 'zod';
import type { WidgetType, WidgetVisibility } from '@/lib/db/schemas/widgets';
import { groupIdSchema } from '@/modules/groups/schemas';

// Primitive schemas

const idSchema = z.uuid();

export const widgetIdSchema = idSchema;
export const widgetDataIdSchema = idSchema;
export const widgetNameSchema = z.string().trim().min(1).max(100);
export const widgetTypeSchema = z.enum(['notes', 'calendar', 'checklist', 'spinner', 'expenses']);
export const widgetVisibilitySchema = z.enum(['private', 'group']);
export const widgetDataContentSchema = z.string().min(1);

// Widget & WidgetData entity schemas

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

export type Widget = z.infer<typeof widgetSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
export type WidgetData = z.infer<typeof widgetDataSchema>;
export type CreateWidgetDataInput = z.infer<typeof createWidgetDataSchema>;
export type UpdateWidgetDataInput = z.infer<typeof updateWidgetDataSchema>;
export type { WidgetType, WidgetVisibility };

// Widget creation form schema

export const createWidgetFormSchema = z.object({
    name: widgetNameSchema,
    type: widgetTypeSchema,
    visibility: widgetVisibilitySchema,
    groupId: groupIdSchema.nullable(),
});

export const createNoteFormSchema = z.object({
    name: widgetNameSchema,
});

export type CreateWidgetFormInput = z.infer<typeof createWidgetFormSchema>;
export type CreateNoteFormInput = z.infer<typeof createNoteFormSchema>;

// Notes schemas

export const updateNoteFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    content: z.string(),
});

export const notesDataSchema = z.object({
    content: z.string(),
});

export const noteEditorFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    content: z.string(),
});

export type UpdateNoteFormInput = z.infer<typeof updateNoteFormSchema>;
export type NoteEditorFormValues = z.infer<typeof noteEditorFormSchema>;
export type NotesData = z.infer<typeof notesDataSchema>;

// Checklist schemas

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

export const checklistDataSchema = z.object({
    items: z.array(checklistItemSchema),
});

export const checklistEditorFormSchema = z.object({
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

export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type UpdateChecklistFormInput = z.infer<typeof updateChecklistFormSchema>;
export type ChecklistEditorFormValues = z.infer<typeof checklistEditorFormSchema>;
export type ChecklistData = z.infer<typeof checklistDataSchema>;

// Calendar schemas

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

export const calendarDataSchema = z.object({
    manualEvents: z.array(calendarManualEventSchema).optional(),
    excludedWidgetIds: z.array(z.uuid()).optional(),
    widgetColors: z.record(z.string(), z.string()).optional(),
});

export type CalendarManualEvent = z.infer<typeof calendarManualEventSchema>;
export type CalendarData = z.infer<typeof calendarDataSchema>;

// Spinner schemas

export const updateSpinnerFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    items: z.array(z.string().trim().min(1).max(200)).min(1),
    intervalDays: z.number().int().positive().nullable(),
});

export const advanceSpinnerSchema = z.object({
    widgetId: widgetIdSchema,
});

export const spinnerDataSchema = z.object({
    items: z.array(z.string()),
    currentIndex: z.number().int().min(0),
    intervalDays: z.number().int().positive().nullable(),
    lastTriggered: z.string().nullable(),
});

export const spinnerEditorFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    items: z
        .array(z.object({ id: z.uuid(), text: z.string().trim().min(1, 'Item is required').max(200) }))
        .min(1, 'At least one item is required'),
    intervalDays: z.enum(['none', '1', '7', '14', '30']),
});

export const calendarEditorFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    excludedWidgetIds: z.array(z.string()),
    manualEvents: z.array(
        z.object({ id: z.string(), title: z.string().trim().min(1).max(200), date: z.string() }),
    ),
    newEventTitle: z.string().max(200),
});

export type UpdateSpinnerFormInput = z.infer<typeof updateSpinnerFormSchema>;
export type SpinnerEditorFormValues = z.infer<typeof spinnerEditorFormSchema>;
export type CalendarEditorFormValues = z.infer<typeof calendarEditorFormSchema>;
export type SpinnerData = z.infer<typeof spinnerDataSchema>;


// Expenses schemas


export const createExpenseFormSchema = z
    .object({
        id: z.string(),
        name: z.string().trim().min(1, 'Expense title is required').max(200),
        price: z.number().positive('Price must be > 0'),
        payedBy: z.uuidv4(),
        payedFor: z.array(z.uuidv4()).min(1, 'At least one person must be selected'),
        payedAt: z.date(),
        isReimbursement: z.boolean(),
    })
    .refine((data) => !data.isReimbursement || data.payedFor.length === 1, {
        message: 'Only one person can be reimbursed at a time',
        path: ['payedFor'],
    });

export const expensesWidgetFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    expenses: z.array(createExpenseFormSchema),
});

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
            payedAt: z.date(),
            isReimbursement: z.boolean(),
        }),
    ),
});

export const expensesDataSchema = z.object({
    expenses: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            payedBy: z.string(),
            payedFor: z.array(z.string()),
            payedAt: z.coerce.date(),
            isReimbursement: z.boolean().default(false),
        }),
    ),
});

export type Expense = z.infer<typeof createExpenseFormSchema>;
export type ExpensesWidgetForm = z.infer<typeof expensesWidgetFormSchema>;
export type ExpensesData = z.infer<typeof expensesDataSchema>;

// Parsed widget data union

export type ParsedWidgetData =
    | { widgetType: 'notes'; data: NotesData }
    | { widgetType: 'expenses'; data: ExpensesData }
    | { widgetType: 'spinner'; data: SpinnerData }
    | { widgetType: 'calendar'; data: CalendarData }
    | { widgetType: 'checklist'; data: ChecklistData }
    | null;

export type ChildWidget = {
    id: string;
    parsedData: ParsedWidgetData;
};