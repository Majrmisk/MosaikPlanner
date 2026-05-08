'use client';

import { z } from "zod";
import {WidgetEditorProps} from "@/modules/widgets/components/widget-editor-props";
import {useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Link from "next/link";
import {ArrowLeft, CalendarIcon, Check, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useSession} from "next-auth/react";
import { Label } from "@/components/ui/label";
import {User, userSchema} from "@/modules/users/schemas";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {updateExpensesWidgetAction} from "@/modules/widgets/actions";
import {
    AlertDialog,
    AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {format} from "date-fns";

export const CreateExpenseFormSchema = z.object({
    id: z.string(),
    name: z.string().trim().min(1, "Expense title is required").max(200),
    price: z.number().positive("Price must be > 0"),
    payedBy: z.uuidv4(),
    payedFor: z.array(z.uuidv4()).min(0, "At least one person must be selected"),
    payedAt: z.date(),
});

export type Expense = z.infer<typeof CreateExpenseFormSchema>;

export const ExpensesWidgetFormSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    expenses: z.array(CreateExpenseFormSchema),
});

type ExpensesWidgetForm = z.infer<typeof ExpensesWidgetFormSchema>;

type CreateExpenseDialogProps = {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    onAddExpenseAction: (newExpense: Expense) => void;
    loggedInUser: User;
    groupUsers: User[];
};

export const CreateExpenseDialog = ({open, onOpenChangeAction, onAddExpenseAction, loggedInUser, groupUsers}: CreateExpenseDialogProps) => {
    const form = useForm<Expense>({
        resolver: zodResolver(CreateExpenseFormSchema),
        defaultValues: {
            id: crypto.randomUUID(),
            name: "New expense",
            price: 1,
            payedBy: loggedInUser.id,
            payedFor: groupUsers.map(u => u.id),
            payedAt: new Date(),
        },
    });

    const payedForValues = form.watch("payedFor") ?? [];

    const togglePayedFor = (memberId: string) => {
        const current = form.getValues(`payedFor`);
        const updated = current.includes(memberId)
            ? current.filter(id => id !== memberId)
            : [...current, memberId];
        form.setValue(`payedFor`, updated, { shouldValidate: true });
    };

    const onCreateExpense = (newExpense: Expense) => {
        console.log(newExpense);
        onAddExpenseAction(newExpense);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Name</Label>
                        <Input placeholder="e.g. Groceries" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Price</Label>
                        <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            {...form.register("price", { valueAsNumber: true })}
                        />
                        {form.formState.errors.price && (
                            <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                        )}
                    </div>


                    <div className="flex flex-col gap-2">
                        <Label>Paid for</Label>
                        <div className="flex flex-wrap gap-2">
                            {groupUsers.map(member => {
                                const selected = payedForValues.includes(member.id);
                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => togglePayedFor(member.id)}
                                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                            selected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }`}
                                    >
                                        {member.name ?? member.email ?? member.id}
                                    </button>
                                );
                            })}
                        </div>
                        {form.formState.errors.payedFor && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.payedFor.message ?? 'Select at least one person'}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Date</Label>
                        <Controller
                            control={form.control}
                            name="payedAt"
                            render={({ field: f }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 size-4" />
                                            {f.value ? format(new Date(f.value), 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={f.value ? new Date(f.value) : undefined}
                                            onSelect={(date) => f.onChange(date ?? new Date())}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>

                    <Button type="button" onClick={form.handleSubmit(onCreateExpense)}>
                        Add
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export const ExpensesEditor = ({widget, widgetData, group}: WidgetEditorProps) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [createExpenseOpen, setCreateExpenseOpen] = useState<boolean>(false);
    const currentUser = useSession().data?.user;
    const loggedInUser = currentUser ? userSchema.safeParse(currentUser).data : null;
    if (!loggedInUser) {
        return null;
    }

    const groupUsers = (widget.groupId && group) ? group.members : [loggedInUser];

    let initExpenses: ExpensesWidgetForm["expenses"] = [];
    try {
        const parsed = JSON.parse(widgetData.data) as { expenses: ExpensesWidgetForm["expenses"] };
        initExpenses = parsed.expenses;
    } catch {
    }

    const form = useForm<ExpensesWidgetForm>({
        resolver: zodResolver(ExpensesWidgetFormSchema),
        defaultValues: {
            title: widget.name,
            expenses: initExpenses,
        }
    });



    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "expenses",
    });

    const debts = calcDebts(fields);

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
    }

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
                            style={{ color: group.color, borderColor: group.color }}
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
                </div>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={saveStatus === 'saving'}
                    size="sm"
                >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                </Button>
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

            {debts.size > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Debts</p>
                    {Array.from(debts.entries()).map(([debtorId, owes]) => (
                        <div key={debtorId} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                    {groupUsers.find(u => u.id === debtorId)?.name ?? debtorId}
                </span>
                            {Array.from(owes.entries()).map(([creditorId, amount]) => (
                                <span key={creditorId} className="pl-3 text-xs text-muted-foreground">
                        → {groupUsers.find(u => u.id === creditorId)?.name ?? creditorId}: ${amount.toFixed(2)}
                    </span>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {fields.length > 0 && (
                <div className="flex flex-col gap-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium">{field.name}</span>
                                <span className="text-xs text-muted-foreground">
                        Paid by {groupUsers.find(u => u.id === field.payedBy)?.name ?? field.payedBy}
                    </span>
                                <span className="text-xs text-muted-foreground">
                        For: {field.payedFor
                                    .map(id => groupUsers.find(u => u.id === id)?.name ?? id)
                                    .join(', ')}
                    </span>
                                <span className="text-xs text-muted-foreground">
                        {new Date(field.payedAt).toLocaleDateString()}
                    </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">${field.price.toFixed(2)}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove expense?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove <strong>{field.name}</strong> from the list. This action cannot be undone.
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
                    ))}
                </div>
            )}


            <Button type="button" variant="outline" className="w-full" onClick={() => setCreateExpenseOpen(true)}>
                <Plus className="size-4" />
                Add expense
            </Button>

            <CreateExpenseDialog
                open={createExpenseOpen}
                onOpenChangeAction={setCreateExpenseOpen}
                onAddExpenseAction={addExpense}
                loggedInUser={loggedInUser}
                groupUsers={groupUsers}
            />
        </div>
    );
};

const calcDebts = (expenses: Expense[]): Map<string, Map<string, number>> => {
    let DebtsMap = new Map<string, Map<string, number>>();

    expenses.forEach(expense => {
        const share = expense.price / expense.payedFor.length;
        expense.payedFor.forEach(p => {
            if (p === expense.payedBy){
                return;
            }

            const debtor = DebtsMap.get(p);
            if (debtor !== undefined) {
                const owesAmount = debtor.get(expense.payedBy) ?? 0
                debtor.set(expense.payedBy, owesAmount + share);
            } else {
                DebtsMap.set(p, new Map([[expense.payedBy, share]]));
            }
        });
    });

    return DebtsMap;
}
