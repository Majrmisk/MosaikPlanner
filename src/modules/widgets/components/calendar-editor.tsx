'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import type { DayButton } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker } from '@/modules/groups/components/color-picker';
import { updateCalendarWidgetAction } from '@/modules/widgets/actions';
import type { WidgetEditorProps } from './widget-editor-props';
import type { CalendarManualEvent } from '@/modules/widgets/schemas';
import type { ChildWidget } from '@/modules/widgets/queries';

type ChecklistItem = { id: string; text: string; completed: boolean; dueDate: string | null };
type SpinnerData = {
    items: string[];
    currentIndex: number;
    intervalDays: number | null;
    lastTriggered: string | null;
};

type CalendarEvent = {
    id: string;
    date: Date;
    title: string;
    widgetId: string;
    widgetName: string;
    source: 'checklist' | 'spinner' | 'manual';
};

const DEFAULT_COLORS = [
    'hsl(220, 100%, 50%)',
    'hsl(340, 100%, 50%)',
    'hsl(120, 100%, 35%)',
    'hsl(40, 100%, 50%)',
    'hsl(280, 100%, 50%)',
];

const MANUAL_COLOR = 'hsl(0, 0%, 60%)';

function parseEventsFromChildren(
    childWidgets: ChildWidget[],
    excludedWidgetIds: string[],
): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    for (const { widget, widgetData } of childWidgets) {
        if (excludedWidgetIds.includes(widget.id)) continue;

        try {
            if (widget.type === 'checklist') {
                const data = JSON.parse(widgetData.data) as { items: ChecklistItem[] };
                for (const item of data.items ?? []) {
                    if (item.dueDate && !item.completed) {
                        events.push({
                            id: item.id,
                            date: parseISO(item.dueDate),
                            title: item.text,
                            widgetId: widget.id,
                            widgetName: widget.name,
                            source: 'checklist',
                        });
                    }
                }
            } else if (widget.type === 'spinner') {
                const data = JSON.parse(widgetData.data) as SpinnerData;
                if (data.intervalDays && data.items.length > 0 && data.lastTriggered) {
                    let date = parseISO(data.lastTriggered);
                    let idx = data.currentIndex;
                    for (let i = 0; i < 52; i++) {
                        date = addDays(date, data.intervalDays);
                        const itemText = data.items[idx % data.items.length];
                        if (itemText) {
                            events.push({
                                id: `${widget.id}-${i}`,
                                date,
                                title: itemText,
                                widgetId: widget.id,
                                widgetName: widget.name,
                                source: 'spinner',
                            });
                        }
                        idx++;
                    }
                }
            }
        } catch {}
    }

    return events;
}

const formSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    excludedWidgetIds: z.array(z.string()),
    manualEvents: z.array(
        z.object({ id: z.string(), title: z.string().trim().min(1).max(200), date: z.string() }),
    ),
    newEventTitle: z.string().max(200),
});

type FormValues = z.infer<typeof formSchema>;

export function CalendarEditor({ widget, widgetData, childWidgets = [] }: WidgetEditorProps) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

    let initExcluded: string[] = [];
    let initManual: CalendarManualEvent[] = [];
    let initColors: Record<string, string> = {};
    try {
        const parsed = JSON.parse(widgetData.data) as {
            excludedWidgetIds?: string[];
            manualEvents?: CalendarManualEvent[];
            widgetColors?: Record<string, string>;
        };
        initExcluded = parsed.excludedWidgetIds ?? [];
        initManual = parsed.manualEvents ?? [];
        initColors = parsed.widgetColors ?? {};
    } catch {}

    const defaultColors: Record<string, string> = {};
    childWidgets.forEach(({ widget: sw }, i) => {
        defaultColors[sw.id] =
            initColors[sw.id] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] ?? 'hsl(220, 100%, 50%)';
    });

    const [widgetColors, setWidgetColors] = useState<Record<string, string>>(defaultColors);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: widget.name,
            excludedWidgetIds: initExcluded,
            manualEvents: initManual,
            newEventTitle: '',
        },
    });

    const excludedWidgetIds = form.watch('excludedWidgetIds');
    const manualEvents = form.watch('manualEvents');

    const childEvents = parseEventsFromChildren(childWidgets, excludedWidgetIds);
    const allManualEvents: CalendarEvent[] = manualEvents.map((e) => ({
        id: e.id,
        date: parseISO(e.date),
        title: e.title,
        widgetId: 'manual',
        widgetName: 'Manual',
        source: 'manual',
    }));
    const allEvents = [...childEvents, ...allManualEvents];

    const eventsOnSelected = selectedDay
        ? allEvents.filter((e) => isSameDay(e.date, selectedDay))
        : [];

    // Map from date string to unique colors for that day
    const colorsByDate: Record<string, string[]> = {};
    for (const event of allEvents) {
        const key = format(event.date, 'yyyy-MM-dd');
        const color =
            event.source === 'manual' ? MANUAL_COLOR : (widgetColors[event.widgetId] ?? MANUAL_COLOR);
        if (!colorsByDate[key]) colorsByDate[key] = [];
        if (!colorsByDate[key]!.includes(color)) colorsByDate[key]!.push(color);
    }

    const CustomDayButton = ({
        day,
        modifiers,
        children,
        ...props
    }: React.ComponentProps<typeof DayButton>) => {
        const key = format(day.date, 'yyyy-MM-dd');
        const colors = colorsByDate[key] ?? [];
        return (
            <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                {children}
                {colors.length > 0 && (
                    <span className="flex justify-center gap-0.5 pb-0.5">
                        {colors.slice(0, 4).map((color, i) => (
                            <span
                                key={i}
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </span>
                )}
            </CalendarDayButton>
        );
    };

    const toggleWidget = (widgetId: string) => {
        const current = form.getValues('excludedWidgetIds');
        const updated = current.includes(widgetId)
            ? current.filter((id) => id !== widgetId)
            : [...current, widgetId];
        form.setValue('excludedWidgetIds', updated);
    };

    const addManualEvent = () => {
        if (!selectedDay) return;
        const title = form.getValues('newEventTitle').trim();
        if (!title) return;
        const newEvent: CalendarManualEvent = {
            id: crypto.randomUUID(),
            title,
            date: format(selectedDay, 'yyyy-MM-dd'),
        };
        form.setValue('manualEvents', [...form.getValues('manualEvents'), newEvent]);
        form.setValue('newEventTitle', '');
    };

    const removeManualEvent = (id: string) => {
        form.setValue(
            'manualEvents',
            form.getValues('manualEvents').filter((e) => e.id !== id),
        );
    };

    const onSubmit = async (values: FormValues) => {
        setSaveStatus('saving');
        try {
            await updateCalendarWidgetAction({
                widgetId: widget.id,
                title: values.title,
                excludedWidgetIds: values.excludedWidgetIds,
                manualEvents: values.manualEvents,
                widgetColors,
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
            setSaveStatus('idle');
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Dashboard
                </Link>
                <div className="flex items-center gap-2">
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

            <Input
                placeholder="Calendar title"
                className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                {...form.register('title')}
            />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex flex-col gap-4">
                    <Calendar
                        mode="single"
                        selected={selectedDay}
                        onSelect={setSelectedDay}
                        components={{ DayButton: CustomDayButton }}
                    />

                    {childWidgets.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Show events from
                            </p>
                            {childWidgets.map(({ widget: sw }, i) => {
                                const enabled = !excludedWidgetIds.includes(sw.id);
                                const color =
                                    widgetColors[sw.id] ??
                                    DEFAULT_COLORS[i % DEFAULT_COLORS.length] ??
                                    'hsl(220, 100%, 50%)';
                                return (
                                    <div key={sw.id} className="flex items-center gap-2 px-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="size-4 shrink-0 rounded-full border border-border transition-opacity hover:opacity-80 disabled:opacity-30"
                                                    style={{
                                                        backgroundColor: enabled ? color : undefined,
                                                    }}
                                                    disabled={!enabled}
                                                    aria-label="Pick color"
                                                />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56 p-3">
                                                <ColorPicker
                                                    value={color}
                                                    onChange={(c) =>
                                                        setWidgetColors((prev) => ({
                                                            ...prev,
                                                            [sw.id]: c,
                                                        }))
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <button
                                            type="button"
                                            onClick={() => toggleWidget(sw.id)}
                                            className={`flex flex-1 items-center gap-1 rounded-md py-1 text-sm transition-colors ${
                                                enabled
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {sw.name}
                                            <span className="text-xs opacity-60">({sw.type})</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-4">
                    <p className="text-sm font-semibold">
                        {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : 'Select a day'}
                    </p>

                    {eventsOnSelected.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No events on this day.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {eventsOnSelected.map((event) => {
                                const color =
                                    event.source !== 'manual'
                                        ? (widgetColors[event.widgetId] ?? 'hsl(220, 100%, 50%)')
                                        : MANUAL_COLOR;
                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">{event.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {event.widgetName}
                                            </span>
                                        </div>
                                        {event.source === 'manual' && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeManualEvent(event.id)}
                                            >
                                                <Trash2 className="size-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedDay && (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add event..."
                                {...form.register('newEventTitle')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addManualEvent();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={addManualEvent}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}