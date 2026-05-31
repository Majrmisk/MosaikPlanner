'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { addDays, parseISO } from 'date-fns';
import { ArrowLeft, Check, ChevronRight, Plus, Trash2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {advanceSpinnerAction, updateChecklistWidgetAction, updateSpinnerWidgetAction} from '@/modules/widgets/actions';
import {
    type ChecklistEditorFormValues,
    spinnerEditorFormSchema,
    type SpinnerEditorFormValues
} from '@/modules/widgets/schemas';
import type { SpinnerEditorProps } from './widget-editor-props';
import {SaveWidgetButton, useWidgetSaveMutation} from "@/modules/widgets/components/saving-button";

const INTERVAL_OPTIONS = [
    { value: 'none', label: 'No interval' },
    { value: '1', label: 'Daily' },
    { value: '7', label: 'Weekly' },
    { value: '14', label: 'Bi-weekly' },
    { value: '30', label: 'Monthly' },
];

export function SpinnerEditor({ widget, parsedData, group }: SpinnerEditorProps) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const initialItems: SpinnerEditorFormValues['items'] = parsedData.items.map((text) => ({
        id: crypto.randomUUID(),
        text,
    }));
    const initialIntervalDays = ((): SpinnerEditorFormValues['intervalDays'] => {
        const days = parsedData.intervalDays;
        if (days === 1 || days === 7 || days === 14 || days === 30) {
            return String(days) as SpinnerEditorFormValues['intervalDays'];
        }
        return 'none';
    })();
    const currentIndex = parsedData.currentIndex;
    const nextSpinDate =
        parsedData.intervalDays && parsedData.lastTriggered
            ? addDays(parseISO(parsedData.lastTriggered), parsedData.intervalDays)
            : null;

    const [activeIndex, setActiveIndex] = useState(currentIndex);

    const form = useForm<SpinnerEditorFormValues>({
        resolver: zodResolver(spinnerEditorFormSchema),
        defaultValues: {
            title: widget.name,
            items: initialItems,
            intervalDays: initialIntervalDays,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const onNext = async () => {
        if (initialItems.length === 0) return;
        await advanceSpinnerAction({ widgetId: widget.id });
        setActiveIndex((prev) => (prev + 1) % initialItems.length);
    };

    const updateSpinnerMutation = useWidgetSaveMutation({
        mutationFn: async (values: SpinnerEditorFormValues) => await updateSpinnerWidgetAction({
            widgetId: widget.id,
            title: values.title,
            items: values.items.map((i) => i.text),
            intervalDays: values.intervalDays === 'none' ? null : Number(values.intervalDays),
            lastTriggered: null,
        }),
        setSaveStatus: setSaveStatus,
    });

    const onSubmit = async (values: SpinnerEditorFormValues) =>
        await updateSpinnerMutation.mutateAsync(values);

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

            <div className="flex flex-col gap-6">
                <Input
                    placeholder="Spinner title"
                    className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                    {...form.register('title')}
                />
                {form.formState.errors.title && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.title.message}
                    </p>
                )}

                {initialItems.length > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="text-lg font-semibold">
                                {initialItems[activeIndex]?.text ?? initialItems[0]?.text}
                            </p>
                            {nextSpinDate && (
                                <p className="text-xs text-muted-foreground">
                                    Next spin:{' '}
                                    <strong>
                                        {nextSpinDate.toLocaleDateString('cs-CZ', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </strong>
                                </p>
                            )}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={onNext}>
                            <ChevronRight className="size-4" />
                            Next
                        </Button>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Label>Items</Label>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-3">
                            <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                                {index + 1}.
                            </span>
                            <Input
                                placeholder="Item name"
                                className="flex-1 border-none px-0 shadow-none focus-visible:ring-0"
                                {...form.register(`items.${index}.text`)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="size-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}
                    {form.formState.errors.items?.root && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.items.root.message}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ id: crypto.randomUUID(), text: '' })}
                            className="w-fit"
                        >
                            <Plus className="size-4" />
                            Add item
                        </Button>
                        {group && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    group.members.forEach((member) => {
                                        const name = member.name ?? member.email;
                                        if (name) {
                                            append({ id: crypto.randomUUID(), text: name });
                                        }
                                    });
                                }}
                                className="w-fit"
                            >
                                <Users className="size-4" />
                                Fill with members
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Interval</Label>
                    <Controller
                        control={form.control}
                        name="intervalDays"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {INTERVAL_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
