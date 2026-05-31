'use client';

import type { ExpensesEditorProps } from '@/modules/widgets/components/widget-editor-props';
import {
    expensesWidgetFormSchema,
    type Expense,
    type ExpensesWidgetForm, type ChecklistEditorFormValues,
} from '@/modules/widgets/schemas';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { userSchema } from '@/modules/users/schemas';
import {updateChecklistWidgetAction, updateExpensesWidgetAction} from '@/modules/widgets/actions';
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
import {SaveWidgetButton, useWidgetSaveMutation} from "@/modules/widgets/components/saving-button";

export type { Expense, ExpensesWidgetForm };

export const ExpensesEditor = ({ widget, parsedData, group }: ExpensesEditorProps) => {
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

    const initExpenses: ExpensesWidgetForm['expenses'] = parsedData.expenses;

    const form = useForm<ExpensesWidgetForm>({
        resolver: zodResolver(expensesWidgetFormSchema),
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

    const updateExpensesMutation = useWidgetSaveMutation({
        mutationFn: async (values: ExpensesWidgetForm) => await updateExpensesWidgetAction({
            widgetId: widget.id,
            title: values.title,
            expenses: values.expenses,
        }),
        setSaveStatus: setSaveStatus,
    });

    const onSubmit = async (values: ExpensesWidgetForm) =>
        await updateExpensesMutation.mutateAsync(values);

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
                    <SaveWidgetButton
                        saveStatus={saveStatus}
                        onClickAction={form.handleSubmit(onSubmit)}
                    />
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
