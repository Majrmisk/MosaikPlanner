'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { widgetNameSchema } from '@/modules/widgets/schemas';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { Group } from '@/modules/groups/schemas';
import { createWidgetAction, addExistingWidgetAction } from '@/modules/dashboard/actions';

const PRIVATE_VALUE = 'private';

const createWidgetFormSchema = z.object({
    name: widgetNameSchema,
    type: z.enum(['notes', 'calendar', 'checklist', 'spinner', 'expenses']),
    target: z.string().min(1),
});

type CreateWidgetFormValues = z.infer<typeof createWidgetFormSchema>;

type AddWidgetDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableGroupWidgets: WidgetRecord[];
    userGroups: Group[];
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create widget'}
        </Button>
    );
}

export function AddWidgetDialog({
    open,
    onOpenChange,
    availableGroupWidgets,
    userGroups,
}: AddWidgetDialogProps) {
    const form = useForm<CreateWidgetFormValues>({
        resolver: zodResolver(createWidgetFormSchema),
        defaultValues: {
            name: '',
            type: 'notes',
            target: PRIVATE_VALUE,
        },
    });

    const onSubmit = async (values: CreateWidgetFormValues) => {
        const isPrivate = values.target === PRIVATE_VALUE;
        await createWidgetAction({
            name: values.name,
            type: values.type,
            visibility: isPrivate ? 'private' : 'group',
            groupId: isPrivate ? null : values.target,
        });
        form.reset();
        onOpenChange(false);
    };

    const handleAddExisting = async (widgetId: string) => {
        await addExistingWidgetAction(widgetId);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-3rem)] sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add widget</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex-1">
                        <h3 className="mb-3 text-sm font-semibold">Add existing</h3>
                        <ScrollArea className="h-52 rounded-md border p-3">
                            {availableGroupWidgets.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No group widgets available
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {availableGroupWidgets.map((w) => {
                                        const group = userGroups.find((g) => g.id === w.groupId);
                                        return (
                                            <button
                                                key={w.id}
                                                onClick={() => handleAddExisting(w.id)}
                                                className="flex items-center justify-between rounded-md p-2 text-left text-sm transition-colors hover:bg-muted"
                                            >
                                                <span className="truncate font-medium">
                                                    {w.name}
                                                </span>
                                                {group && (
                                                    <span
                                                        className="ml-2 flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
                                                        style={{
                                                            color: group.color,
                                                            borderColor: group.color,
                                                        }}
                                                    >
                                                        {group.name}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <Separator orientation="vertical" className="hidden sm:block" />
                    <Separator className="sm:hidden" />

                    <div className="flex-1">
                        <h3 className="mb-3 text-sm font-semibold">Create new</h3>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="widget-name">Name</Label>
                                <Input
                                    id="widget-name"
                                    placeholder="My notes"
                                    {...form.register('name')}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Type</Label>
                                <Controller
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="notes">Notes</SelectItem>
                                                <SelectItem value="calendar">Calendar</SelectItem>
                                                <SelectItem value="checklist">Checklist</SelectItem>
                                                <SelectItem value="spinner">Spinner</SelectItem>
                                                <SelectItem value="expenses">Expenses</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Owner</Label>
                                <Controller
                                    control={form.control}
                                    name="target"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={PRIVATE_VALUE}>
                                                    Private
                                                </SelectItem>
                                                {userGroups.map((group) => (
                                                    <SelectItem key={group.id} value={group.id}>
                                                        {group.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <SubmitButton />
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
