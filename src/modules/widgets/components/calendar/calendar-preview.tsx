import { CalendarDays } from 'lucide-react';
import { addDays, isSameDay, parseISO } from 'date-fns';
import type { WidgetPreviewProps } from '../../../dashboard/components/widget-card';
import {
    CalendarManualEvent,
    PreviewEvent,
} from "@/modules/widgets/components/calendar/schema";
import {ChecklistItem} from "@/modules/widgets/components/checklist/schema";
import {SpinnerData} from "@/modules/widgets/components/spinner/schema";

const getChildEvents = (
    childWidgets: WidgetPreviewProps['childWidgets'],
    excludedWidgetIds: string[],
): PreviewEvent[] => {
    const events: PreviewEvent[] = [];
    for (const sw of childWidgets ?? []) {
        if (excludedWidgetIds.includes(sw.id)) continue;
        try {
            if (sw.type === 'checklist') {
                /**
                 * Co se tady stane, pokud format dat nebude sedet? Co rika "as"?
                 * Pokud tady chceme realnou typovou kontrolu (chceme!), musime to validovat,
                 * ne jen utidit TS pomoci "as".
                 *
                 * Pokud budeme mit data typove cista, mozna nebude treba obalovat try catchem?
                 *
                 * tip #1: zodSchema.safeParse()
                 * tip #2: zod.inferType (abychom nemeli schema a typ duplicitni)
                 */
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
        } catch {
            // Urcite chceme chyby komplet ignorovat?
        }
    }
    return events;
};

export const CalendarPreview = ({ data, childWidgets }: WidgetPreviewProps) => {
    /**
     * "let" v kodu konponenty je automaticky red flag, stejne jako try catch. Proc?
     */
    let manualEvents: CalendarManualEvent[] = [];
    let excludedWidgetIds: string[] = [];
    try {
        /**
         * Proc parsujeme data zde? Zamyslete se prosim nad tim, jak casto se vola tento kod.
         */
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
};

/**
 * Prosim nez si prectete tento komentar, kde uvadim spravne odpovedi a realne pozadavky
 * na zlepseni, zkuste se zamyslet nad otazkami, ktere jsem vyse napsal.
 *
 * Takze vecne: CalendarPreview je child component WidgetCard. WidgetCard je client komponenta,
 * takze i CalendarPreview se realne renderuje na klientovi (mozna by se hodilo i zde uvest "use client").
 * Jelikoz je WidgetCard client komponenta, tak se renderuje pomerne casto - pri kazde zmene statu,
 * pozice atd. Kdyz React vyhodnoti potrebu rerenderu WidgetCard, rerenderuje i vsechny jeho potomky
 * v DOM - tedy i nas CalendarPreview. To znamena, ze se kod v CalendarPreview muze spoustet pomerne
 * dost casto, a to i v pripade, ze se nezmenila zadna data, ktera zpracovava. To je velice dulezite si
 * uvedomit - render teto komponenty neni nejaka jednorazova akce, kde zparsuju data a mam vyresene. Tento
 * kod, ktery muze byt pomerne vypocetne drahy, se pocita stale a stale dokola. Chci:
 * 1) aby parsovani dat neprobihalo zde v komponente. Toto ma probihat vyse nekde v server funkci, ktera
 *    se vola v server komponente, cimz se data getuji a pripravuji pro klienta. Tam podle typu widgetu
 *    zparsuju data (safeParse, nikoli as) a pripravim je pro klienta ciste typovana.
 * 2) let a try catch vyhodit, data rozumne memoizovat, aby netrpel vykon (uvidite, ze se tim zlepsi
 *    response widgetu)
 * 3) typy vyseparovat do spolecneho souboru podle schemat
 *
 * Vsechny tyto poznamky plati i pro ostatni preview komponenty samozrejme.
 */
