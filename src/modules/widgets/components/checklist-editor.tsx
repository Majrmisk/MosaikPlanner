'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Check, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { updateChecklistWidgetAction } from '@/modules/widgets/actions';
import {
    checklistEditorFormSchema,
    type ChecklistEditorFormValues,
} from '@/modules/widgets/schemas';
import type { ChecklistEditorProps } from './widget-editor-props';
import {useMutation} from "@tanstack/react-query";
import {SaveWidgetButton, useWidgetSaveMutation} from "@/modules/widgets/components/saving-button";

export function ChecklistEditor({ widget, parsedData, group }: ChecklistEditorProps) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [openPopover, setOpenPopover] = useState<number | null>(null);

    const initialItems: ChecklistEditorFormValues['items'] = parsedData.items;

    const form = useForm<ChecklistEditorFormValues>({
        resolver: zodResolver(checklistEditorFormSchema),
        defaultValues: {
            title: widget.name,
            items: initialItems,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const updateChecklistMutation = useWidgetSaveMutation({
        mutationFn: async (values: ChecklistEditorFormValues) => await updateChecklistWidgetAction({
            widgetId: widget.id,
            title: values.title,
            items: values.items,
        }),
        setSaveStatus: setSaveStatus,
    });

    const onSubmit = async (values: ChecklistEditorFormValues) =>
        await updateChecklistMutation.mutateAsync(values);

    const addItem = () => {
        append({ id: crypto.randomUUID(), text: '', completed: false, dueDate: null });
    };

    const formatDate = (date: string) =>
        new Date(date + 'T12:00:00').toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'short',
        });

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

            <div className="flex flex-col gap-4">
                <Input
                    placeholder="Checklist title"
                    className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                    {...form.register('title')}
                />
                {form.formState.errors.title && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.title.message}
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    {fields.map((field, index) => {
                        const dueDate = form.watch(`items.${index}.dueDate`);
                        return (
                            <div key={field.id} className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={form.watch(`items.${index}.completed`)}
                                    onChange={(e) =>
                                        form.setValue(`items.${index}.completed`, e.target.checked)
                                    }
                                    className="size-4 cursor-pointer"
                                />
                                <Input
                                    placeholder="Item text"
                                    className="flex-1 border-none px-0 shadow-none focus-visible:ring-0"
                                    {...form.register(`items.${index}.text`)}
                                />
                                <Popover
                                    open={openPopover === index}
                                    onOpenChange={(open) => setOpenPopover(open ? index : null)}
                                >
                                    <PopoverTrigger asChild>
                                        {dueDate ? (
                                            <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                <CalendarDays className="size-3" />
                                                {formatDate(dueDate)}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        form.setValue(
                                                            `items.${index}.dueDate`,
                                                            null,
                                                        );
                                                    }}
                                                    className="ml-1 hover:text-foreground"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </span>
                                        ) : (
                                            <Button type="button" variant="ghost" size="icon">
                                                <CalendarDays className="size-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                dueDate
                                                    ? new Date(dueDate + 'T12:00:00')
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                form.setValue(
                                                    `items.${index}.dueDate`,
                                                    date ? format(date, 'yyyy-MM-dd') : null,
                                                );
                                                setOpenPopover(null);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="size-4 text-muted-foreground" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="w-fit"
                >
                    <Plus className="size-4" />
                    Add item
                </Button>
            </div>
        </div>
    );
}
