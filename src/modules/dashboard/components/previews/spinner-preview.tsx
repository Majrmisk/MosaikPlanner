'use client';

import { useTransition } from 'react';
import { ChevronRight } from 'lucide-react';
import { addDays, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { advanceSpinnerAction } from '@/modules/widgets/actions';
import type { WidgetPreviewProps } from '../widget-card';

const INTERVAL_LABELS: Record<number, string> = {
    1: 'daily',
    7: 'weekly',
    14: 'bi-weekly',
    30: 'monthly',
};

export function SpinnerPreview({ data, widgetId }: WidgetPreviewProps) {
    const [isPending, startTransition] = useTransition();

    let items: string[] = [];
    let currentIndex = 0;
    let intervalDays: number | null = null;
    let lastTriggered: string | null = null;
    try {
        const parsed = JSON.parse(data) as {
            items?: string[];
            currentIndex?: number;
            intervalDays?: number | null;
            lastTriggered?: string | null;
        };
        items = parsed.items ?? [];
        currentIndex = parsed.currentIndex ?? 0;
        intervalDays = parsed.intervalDays ?? null;
        lastTriggered = parsed.lastTriggered ?? null;
    } catch {}

    const nextSpinDate =
        intervalDays && lastTriggered ? addDays(parseISO(lastTriggered), intervalDays) : null;

    if (items.length === 0) {
        return <p className="text-xs text-muted-foreground">No items</p>;
    }

    const currentItem = items[currentIndex] ?? items[0];
    const nextItem = items[(currentIndex + 1) % items.length];

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        startTransition(async () => {
            await advanceSpinnerAction({ widgetId });
        });
    };

    return (
        <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-center text-2xl font-bold">{currentItem}</p>
            {intervalDays && (
                <p className="text-xs text-muted-foreground">
                    {INTERVAL_LABELS[intervalDays] ?? `every ${intervalDays} days`}
                    {nextSpinDate && (
                        <>
                            {' '}
                            (
                            <strong>
                                {nextSpinDate.toLocaleDateString('cs-CZ', {
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </strong>
                            )
                        </>
                    )}
                </p>
            )}
            <Button
                size="sm"
                variant="outline"
                onClick={handleNext}
                disabled={isPending}
                className="mt-1 gap-1"
            >
                Next
                <ChevronRight className="size-3" />
            </Button>
            {items.length > 1 && <p className="text-xs text-muted-foreground">Next: {nextItem}</p>}
        </div>
    );
}
