'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DashboardWidget } from '@/modules/dashboard/schemas';
import { removeWidgetFromDashboardAction } from '@/modules/dashboard/actions';
import { RemoveWidgetConfirm } from './remove-widget-confirm';
import {
    NotesPreview,
    CalendarPreview,
    ChecklistPreview,
    SpinnerPreview,
    ExpensesPreview,
} from './previews';

type WidgetCardProps = {
    dashboardItem: DashboardWidget;
    'data-widget-id'?: string;
    'data-order-index'?: number;
};

export type WidgetPreviewProps = {
    data: string;
};

function DefaultPreview() {
    return (
        <p className="line-clamp-3 text-xs text-muted-foreground">No preview</p>
    );
}

const widgetPreviews: Record<string, ComponentType<WidgetPreviewProps>> = {
    notes: NotesPreview,
    calendar: CalendarPreview,
    checklist: ChecklistPreview,
    spinner: SpinnerPreview,
    expenses: ExpensesPreview,
};

export function WidgetCard({ dashboardItem, ...dataAttrs }: WidgetCardProps) {
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [removing, setRemoving] = useState(false);

    const { widget } = dashboardItem;
    const PreviewComponent = widgetPreviews[widget.type] ?? DefaultPreview;
    const isPrivate = widget.visibility === 'private';

    const handleRemove = async () => {
        setRemoving(true);
        try {
            await removeWidgetFromDashboardAction(dashboardItem.id);
        } finally {
            setRemoving(false);
            setConfirmOpen(false);
        }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // viz comment in removeWidgetFromDashboardAction
        if (isPrivate) {
            setConfirmOpen(true);
        } else {
            handleRemove();
        }
    };

    return (
        <>
            <Card
                className="group relative h-68 w-64 cursor-pointer gap-2 pt-0 transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/widgets/${dashboardItem.widgetId}`)}
                {...dataAttrs}
            >
                <CardHeader className="flex flex-row items-center justify-between pt-3">
                    <CardTitle className="truncate text-sm font-semibold">
                        {widget.name}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={handleRemoveClick}
                        disabled={removing}
                    >
                        <X className="size-3.5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <PreviewComponent data={widget.data.data} />
                </CardContent>
            </Card>
            {isPrivate && (
                <RemoveWidgetConfirm
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    widgetName={widget.name}
                    onConfirm={handleRemove}
                    loading={removing}
                />
            )}
        </>
    );
}
