import { CreateExpenseFormSchema, Expense } from '@/modules/widgets/components/expenses-editor';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { User } from '@/modules/users/schemas';
import { Checkbox } from '@/components/ui/checkbox';

type CreateExpenseDialogProps = {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    onAddExpenseAction: (newExpense: Expense) => void;
    loggedInUser: User;
    groupUsers: User[];
    defaultPrice?: number;
    defaultPayedToIds?: string[];
    isReimbursement: boolean;
};

export const CreateExpenseDialog = ({
    open,
    onOpenChangeAction,
    onAddExpenseAction,
    loggedInUser,
    groupUsers,
    defaultPrice,
    defaultPayedToIds,
    isReimbursement,
}: CreateExpenseDialogProps) => {
    const form = useForm<Expense>({
        resolver: zodResolver(CreateExpenseFormSchema),
        defaultValues: {
            id: crypto.randomUUID(),
            name: 'New expense',
            price: defaultPrice ?? 1,
            payedBy: loggedInUser.id,
            payedFor: defaultPayedToIds ?? groupUsers.map((u) => u.id),
            payedAt: new Date(),
            isReimbursement: isReimbursement,
        },
    });

    const payedForValues = form.watch('payedFor') ?? [];

    const togglePayedFor = (memberId: string) => {
        const current = form.getValues(`payedFor`);
        const updated = current.includes(memberId)
            ? current.filter((id) => id !== memberId)
            : [...current, memberId];
        form.setValue(`payedFor`, updated, { shouldValidate: true });
    };

    const onCreateExpense = (newExpense: Expense) => {
        console.log(newExpense);
        onAddExpenseAction(newExpense);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Name</Label>
                        <Input placeholder="e.g. Groceries" {...form.register('name')} />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Price</Label>
                        <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            {...form.register('price', { valueAsNumber: true })}
                        />
                        {form.formState.errors.price && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.price.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Paid for</Label>
                        <div className="flex flex-wrap gap-2">
                            {groupUsers.map((member) => {
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
                                {form.formState.errors.payedFor.message ??
                                    'Select at least one person'}
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
                                            {f.value
                                                ? format(new Date(f.value), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={f.value ? new Date(f.value) : new Date()}
                                            onSelect={(date) => f.onChange(date ?? new Date())}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Controller
                            control={form.control}
                            name="isReimbursement"
                            render={({ field: f }) => (
                                <Checkbox
                                    id="isReimbursement"
                                    checked={f.value}
                                    onCheckedChange={f.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="isReimbursement" className="cursor-pointer">
                            This is a reimbursement
                        </Label>
                    </div>

                    <Button type="button" onClick={form.handleSubmit(onCreateExpense)}>
                        Add
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
