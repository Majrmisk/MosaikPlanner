import { CalendarDays } from 'lucide-react';
import { addDays, isSameDay, parseISO } from 'date-fns';
import type { WidgetPreviewProps } from '../widget-card';
import type { CalendarManualEvent } from '@/modules/widgets/schemas';

type ChecklistItem = { id: string; text: string; completed: boolean; dueDate: string | null };
type SpinnerData = {
    items: string[];
    currentIndex: number;
    intervalDays: number | null;
    lastTriggered: string | null;
};

type PreviewEvent = { id: string; title: string; date: Date };

function getChildEvents(
    childWidgets: WidgetPreviewProps['childWidgets'],
    excludedWidgetIds: string[],
): PreviewEvent[] {
    const events: PreviewEvent[] = [];
    for (const sw of childWidgets ?? []) {
        if (excludedWidgetIds.includes(sw.id)) continue;
        try {
            if (sw.type === 'checklist') {
                const data = JSON.parse(sw.data) as { items: ChecklistItem[] };
                for (const item of data.items ?? []) {
                    if (item.dueDate && !item.completed) {
                        events.push({
                            id: item.id,
                            title: item.text,
                            date: parseISO(item.dueDate),
                        });
                    }
                }
            } else if (sw.type === 'spinner') {
                const data = JSON.parse(sw.data) as SpinnerData;
                if (data.intervalDays && data.items.length > 0 && data.lastTriggered) {
                    let date = parseISO(data.lastTriggered);
                    const idx = data.currentIndex + 1; // so we get the next one
                    date = addDays(date, data.intervalDays);
                    const text = data.items[idx % data.items.length];
                    if (text) events.push({ id: `${sw.id}`, title: text, date });
                }
            }
        } catch {}
    }
    return events;
}

export function CalendarPreview({ data, childWidgets }: WidgetPreviewProps) {
    let manualEvents: CalendarManualEvent[] = [];
    let excludedWidgetIds: string[] = [];
    try {
        const parsed = JSON.parse(data) as {
            manualEvents?: CalendarManualEvent[];
            excludedWidgetIds?: string[];
        };
        manualEvents = parsed.manualEvents ?? [];
        excludedWidgetIds = parsed.excludedWidgetIds ?? [];
    } catch {}

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const childEvents = getChildEvents(childWidgets, excludedWidgetIds);
    const manualAsEvents: PreviewEvent[] = manualEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: parseISO(e.date),
    }));

    const allEvents = [...manualAsEvents, ...childEvents];

    const todayEvents = allEvents.filter((e) => isSameDay(e.date, today));
    const upcoming = allEvents
        .filter((e) => e.date > today)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, todayEvents.length > 0 ? 3 : 4);

    const displayed = [...todayEvents, ...upcoming].slice(0, 4);

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
}
