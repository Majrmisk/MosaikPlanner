import { widgetIdSchema } from "../../schemas";
import {z} from "zod";

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

export const CreateExpenseFormSchema = z
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

export const ExpensesWidgetFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    expenses: z.array(CreateExpenseFormSchema),
});

export type ExpensesWidgetForm = z.infer<typeof ExpensesWidgetFormSchema>;

export type Expense = z.infer<typeof CreateExpenseFormSchema>;
