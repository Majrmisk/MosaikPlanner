'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardWidget } from '@/modules/dashboard/schemas';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { Group } from '@/modules/groups/schemas';
import { reorderWidgetsAction } from '@/modules/dashboard/actions';
import { WidgetCard } from './widget-card';
import { AddWidgetDialog } from './add-widget-dialog';

type DashboardGridProps = {
    widgets: DashboardWidget[];
    availableGroupWidgets: WidgetRecord[];
    userGroups: Group[];
};

export function DashboardGrid({ widgets, availableGroupWidgets, userGroups }: DashboardGridProps) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [items, setItems] = useState(widgets);
    const [prevWidgets, setPrevWidgets] = useState(widgets);
    const [activeId, setActiveId] = useState<string | null>(null);

    if (prevWidgets !== widgets) {
        setPrevWidgets(widgets);
        setItems(widgets);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);

        const updates = reordered.map((item, index) => ({
            id: item.id,
            orderIndex: index,
        }));
        reorderWidgetsAction(updates);
    };

    const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

    return (
        <DndContext
            id="dashboard-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-wrap justify-center gap-4">
                <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                    {items.map((item) => (
                        <WidgetCard key={item.id} dashboardItem={item} />
                    ))}
                </SortableContext>
                <Card
                    className="flex h-68 w-64 cursor-pointer items-center justify-center border-dashed transition-colors hover:border-foreground/30 hover:bg-muted/50"
                    onClick={() => setAddDialogOpen(true)}
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Plus className="size-8" />
                        <span className="text-sm font-medium">Add widget</span>
                    </div>
                </Card>
            </div>
            <DragOverlay>
                {activeItem ? (
                    <Card className="h-68 w-64 rotate-3 opacity-80 shadow-xl">
                        <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">
                            {activeItem.widget.name}
                        </div>
                    </Card>
                ) : null}
            </DragOverlay>
            <AddWidgetDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                availableGroupWidgets={availableGroupWidgets}
                userGroups={userGroups}
            />
        </DndContext>
    );
}
