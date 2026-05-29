'use client';

import { useMutation } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { addDays, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { advanceSpinnerAction } from '@/modules/widgets/actions';
import type { SpinnerData } from '@/modules/widgets/schemas';

const INTERVAL_LABELS: Record<number, string> = {
    1: 'daily',
    7: 'weekly',
    14: 'bi-weekly',
    30: 'monthly',
};

type SpinnerPreviewProps = { parsedData: SpinnerData; widgetId: string };

function useAdvanceSpinnerMutation() {
    return useMutation({
        mutationFn: (widgetId: string) => advanceSpinnerAction({ widgetId }),
    });
}

export const SpinnerPreview = ({ parsedData, widgetId }: SpinnerPreviewProps) => {
    const mutation = useAdvanceSpinnerMutation();
    const { items, currentIndex, intervalDays, lastTriggered } = parsedData;

    if (items.length === 0) {
        return <p className="text-xs text-muted-foreground">No items</p>;
    }

    const nextSpinDate =
        intervalDays && lastTriggered ? addDays(parseISO(lastTriggered), intervalDays) : null;

    const currentItem = items[currentIndex] ?? items[0];
    const nextItem = items[(currentIndex + 1) % items.length];

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        mutation.mutate(widgetId);
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
            {mutation.isError && (
                <p className="text-xs text-destructive">Failed to advance spinner</p>
            )}
            <Button
                size="sm"
                variant="outline"
                onClick={handleNext}
                disabled={mutation.isPending}
                className="mt-1 gap-1"
            >
                Next
                <ChevronRight className="size-3" />
            </Button>
            {items.length > 1 && <p className="text-xs text-muted-foreground">Next: {nextItem}</p>}
        </div>
    );
};