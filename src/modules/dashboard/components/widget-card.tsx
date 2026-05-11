'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardWidget } from '@/modules/dashboard/schemas';
import type { Group } from '@/modules/groups/schemas';
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
    group: Group | null;
    childWidgets?: ChildWidgetData[];
};

export type ChildWidgetData = {
    id: string;
    type: string;
    name: string;
    data: string;
};

export type WidgetPreviewProps = {
    data: string;
    childWidgets?: ChildWidgetData[];
    widgetId: string;
};

function DefaultPreview() {
    return <p className="line-clamp-3 text-xs text-muted-foreground">No preview</p>;
}

const widgetPreviews: Record<string, ComponentType<WidgetPreviewProps>> = {
    notes: NotesPreview,
    calendar: CalendarPreview,
    checklist: ChecklistPreview,
    spinner: SpinnerPreview,
    expenses: ExpensesPreview,
};

export function WidgetCard({ dashboardItem, group, childWidgets }: WidgetCardProps) {
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [removing, setRemoving] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: dashboardItem.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

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
        if (isPrivate) {
            setConfirmOpen(true);
        } else {
            handleRemove();
        }
    };

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                className={`group relative h-68 w-64 cursor-pointer gap-2 pt-0 transition-colors hover:bg-muted/50 ${isDragging ? 'z-50 opacity-50' : ''}`}
                onClick={() => router.push(`/widgets/${dashboardItem.widgetId}`)}
                {...attributes}
            >
                <CardHeader className="flex flex-row items-center justify-between pl-2 pt-3">
                    <div
                        className="cursor-grab touch-none active:cursor-grabbing"
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="size-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {widget.name}
                    </CardTitle>
                    {group && (
                        <span
                            className="flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ color: group.color, borderColor: group.color }}
                        >
                            {group.name}
                        </span>
                    )}
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
                    <PreviewComponent
                        data={widget.data.data}
                        widgetId={dashboardItem.widgetId}
                        childWidgets={childWidgets}
                    />
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
