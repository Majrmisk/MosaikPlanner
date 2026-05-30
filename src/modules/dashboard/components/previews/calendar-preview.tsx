'use client';

import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { addDays, isSameDay, parseISO } from 'date-fns';
import type { CalendarData, ChildWidget } from '@/modules/widgets/schemas';
type CalendarPreviewProps = {
    parsedData: CalendarData;
    childWidgets?: ChildWidget[];
    widgetId: string;
};

type PreviewEvent = { id: string; title: string; date: Date };

const getChildEvents = (
    childWidgets: ChildWidget[] | undefined,
    excludedWidgetIds: string[],
): PreviewEvent[] => {
    const events: PreviewEvent[] = [];
    for (const sw of childWidgets ?? []) {
        if (excludedWidgetIds.includes(sw.id)) continue;

        switch (sw.parsedData?.widgetType) {
            case 'checklist':
                for (const item of sw.parsedData.data.items) {
                    if (item.dueDate && !item.completed) {
                        events.push({
                            id: item.id,
                            title: item.text,
                            date: parseISO(item.dueDate),
                        });
                    }
                }
                break;
            case 'spinner': {
                const { items, currentIndex, intervalDays, lastTriggered } = sw.parsedData.data;
                if (intervalDays && items.length > 0 && lastTriggered) {
                    const date = addDays(parseISO(lastTriggered), intervalDays);
                    const text = items[(currentIndex + 1) % items.length];
                    if (text) events.push({ id: sw.id, title: text, date });
                }
                break;
            }
        }
    }
    return events;
};

export const CalendarPreview = ({ parsedData, childWidgets }: CalendarPreviewProps) => {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const allEvents = useMemo(() => {
        const manualEvents = parsedData.manualEvents ?? [];
        const excludedWidgetIds = parsedData.excludedWidgetIds ?? [];
        const childEvents = getChildEvents(childWidgets, excludedWidgetIds);
        const manualAsEvents: PreviewEvent[] = manualEvents.map((e) => ({
            id: e.id,
            title: e.title,
            date: parseISO(e.date),
        }));
        return [...manualAsEvents, ...childEvents];
    }, [childWidgets, parsedData]);

    const displayed = useMemo(() => {
        const todayEvents = allEvents.filter((e) => isSameDay(e.date, today));
        const upcoming = allEvents
            .filter((e) => e.date > today)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, todayEvents.length > 0 ? 3 : 4);
        return [...todayEvents, ...upcoming].slice(0, 4);
    }, [allEvents, today]);

    if (displayed.length === 0) {
        return <p className="text-xs text-muted-foreground">No upcoming events</p>;
    }

    return (
        <div className="flex flex-col gap-1">
            {displayed.map((event) => (
                <div key={event.id} className="flex items-center gap-2">
                    <CalendarDays className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs">{event.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {isSameDay(event.date, today)
                            ? 'Today'
                            : event.date.toLocaleDateString('cs-CZ', {
                                  day: 'numeric',
                                  month: 'short',
                              })}
                    </span>
                </div>
            ))}
        </div>
    );
};
