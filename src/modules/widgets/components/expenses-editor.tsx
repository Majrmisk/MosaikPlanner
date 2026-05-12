'use client';

import { z } from 'zod';
import { WidgetEditorProps } from '@/modules/widgets/components/widget-editor-props';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { userSchema } from '@/modules/users/schemas';
import { updateExpensesWidgetAction } from '@/modules/widgets/actions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CreateExpenseDialog } from '@/modules/widgets/components/expenses-create-dialog';
import { ExpensesChart } from '@/modules/widgets/components/expenses-chart';
import { ExpensesDebts } from '@/modules/widgets/components/expenses-debts';
import { ExpensesFilter, ExpensesFilterValues } from '@/modules/widgets/components/expenses-filter';
import { Separator } from '@/components/ui/separator';

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

export type Expense = z.infer<typeof CreateExpenseFormSchema>;

export const ExpensesWidgetFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    expenses: z.array(CreateExpenseFormSchema),
});

export type ExpensesWidgetForm = z.infer<typeof ExpensesWidgetFormSchema>;

export const ExpensesEditor = ({ widget, widgetData, group }: WidgetEditorProps) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [createExpenseOpen, setCreateExpenseOpen] = useState<boolean>(false);
    const [payDebtTo, setPayDebtTo] = useState<string[] | undefined>(undefined);
    const [payDebtAmout, setPayDebtAmout] = useState<number | undefined>(undefined);
    const [createReimbursement, setCreateReimbursement] = useState<boolean>(false);
    const [filter, setFilter] = useState<ExpensesFilterValues>({
        type: 'all',
        minPrice: 0,
        maxPrice: undefined,
        dateFrom: undefined,
        dateTo: undefined,
    });
    const currentUser = useSession().data?.user;

    let initExpenses: ExpensesWidgetForm['expenses'] = [];
    try {
        const parsed = JSON.parse(widgetData.data) as { expenses: ExpensesWidgetForm['expenses'] };
        initExpenses = parsed.expenses.map((e) => ({
            ...e,
            payedAt: new Date(e.payedAt), // they are loaded as strings, fail zod validation otherwise
        }));
    } catch {}

    const form = useForm<ExpensesWidgetForm>({
        resolver: zodResolver(ExpensesWidgetFormSchema),
        defaultValues: {
            title: widget.name,
            expenses: initExpenses,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'expenses',
    });

    const filteredFields = fields.filter((field) => {
        if (filter.type === 'expenses' && field.isReimbursement) return false;
        if (filter.type === 'reimbursements' && !field.isReimbursement) return false;
        if (field.price < filter.minPrice) return false;
        if (filter.maxPrice && field.price > filter.maxPrice) return false;

        if (filter.dateFrom && field.payedAt < filter.dateFrom) return false;
        if (filter.dateTo && field.payedAt > filter.dateTo) return false;
        return true;
    });

    const loggedInUser = currentUser ? userSchema.safeParse(currentUser).data : null;
    if (!loggedInUser) {
        return null;
    }
    const groupUsers = widget.groupId && group ? group.members : [loggedInUser];

    const settleDebt = (toId: string, amount: number) => {
        setPayDebtTo([toId]);
        setPayDebtAmout(amount);
        setCreateReimbursement(true);
        setCreateExpenseOpen(true);
    };

    const onSubmit = async (values: ExpensesWidgetForm) => {
        setSaveStatus('saving');
        try {
            await updateExpensesWidgetAction({
                widgetId: widget.id,
                title: values.title,
                expenses: values.expenses,
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
            setSaveStatus('idle');
        }
    };

    const addExpense = (expense: Expense) => {
        append(expense);
        setCreateExpenseOpen(false);
        setCreateReimbursement(false);
    };

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    {group && (
                        <span
                            className="flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                            style={{
                                color: group.color,
                                borderColor: group.color,
                                backgroundColor: 'white',
                            }}
                        >
                            {group.name}
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="size-3" />
                            Saved
                        </span>
                    )}
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={saveStatus === 'saving'}
                        size="sm"
                    >
                        {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <Input
                    placeholder="Expenses widget title"
                    className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                    {...form.register('title')}
                />
                {form.formState.errors.title && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.title.message}
                    </p>
                )}
            </div>

            <ExpensesChart expenses={fields} groupUsers={groupUsers} />

            <ExpensesDebts
                expenses={fields}
                groupUsers={groupUsers}
                loggedInUser={loggedInUser}
                onSettleDebt={settleDebt}
            />

            {fields.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Expenses
                    </p>

                    <ExpensesFilter value={filter} onChangeAction={setFilter} />

                    <Separator />

                    {filteredFields.map((field) => {
                        const index = fields.findIndex((f) => f.id === field.id);
                        return (
                            <div
                                key={field.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-medium">{field.name}</span>
                                        {field.isReimbursement && (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                Reimbursement
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Paid by{' '}
                                        {groupUsers.find((u) => u.id === field.payedBy)?.name ??
                                            field.payedBy}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        For:{' '}
                                        {field.payedFor
                                            .map(
                                                (id) =>
                                                    groupUsers.find((u) => u.id === id)?.name ?? id,
                                            )
                                            .join(', ')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(field.payedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">
                                        ${field.price.toFixed(2)}
                                    </span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove expense?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will remove <strong>{field.name}</strong>{' '}
                                                    from the list. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => remove(index)}>
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setCreateExpenseOpen(true)}
            >
                <Plus className="size-4" />
                Add expense
            </Button>

            {createExpenseOpen && ( // done like this to remount to pass defaultPayedToIds and defaultPrice
                <CreateExpenseDialog
                    open={createExpenseOpen}
                    onOpenChangeAction={setCreateExpenseOpen}
                    onAddExpenseAction={addExpense}
                    loggedInUser={loggedInUser}
                    groupUsers={groupUsers}
                    defaultPayedToIds={payDebtTo}
                    defaultPrice={payDebtAmout}
                    isReimbursement={createReimbursement}
                />
            )}
        </div>
    );
};
