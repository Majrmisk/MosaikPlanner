'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { WidgetEditorProps } from '../widget-editor-props';
import {updateNoteWidgetAction} from "@/backend/widgets/notes/mutations";
import {noteFormSchema, NoteFormValues} from "@/modules/widgets/components/notes/schema";

export const NotesEditor = ({ widget, widgetData, group }: WidgetEditorProps) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    let initialContent = '';
    try {
        // nope. Six kdekoli, kde se vyskytuje. Viz CalendarPreview.
        const parsed = JSON.parse(widgetData.data) as { content: string };
        initialContent = parsed.content;
    } catch {}

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteFormSchema),
        defaultValues: {
            title: widget.name,
            content: initialContent,
        },
    });

    const onSubmit = async (values: NoteFormValues) => {
        setSaveStatus('saving');
        try {
            await updateNoteWidgetAction({
                widgetId: widget.id,
                title: values.title,
                content: values.content,
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
            setSaveStatus('idle');
        }
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

            <div className="flex flex-col gap-4">
                <Input
                    placeholder="Note title"
                    className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                    {...form.register('title')}
                />
                {form.formState.errors.title && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.title.message}
                    </p>
                )}
                <Textarea
                    placeholder="Start writing..."
                    className="min-h-[50vh] resize-none border-none px-0 shadow-none focus-visible:ring-0"
                    {...form.register('content')}
                />
            </div>
        </div>
    );
};
