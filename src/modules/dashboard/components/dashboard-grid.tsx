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
import type { ChildWidgetData } from './widget-card';
import { AddWidgetDialog } from './add-widget-dialog';

type DashboardGridProps = {
    widgets: DashboardWidget[];
    availableGroupWidgets: WidgetRecord[];
    userGroups: Group[];
};

export const DashboardGrid = ({
    widgets,
    availableGroupWidgets,
    userGroups,
}: DashboardGridProps) => {
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
                    {items.map((item) => {
                        /**
                         * Toto by si zaslouzilo vlastni komponentu, co rikate? V teto nove
                         * vzniknuvsi komponente se muzete rovnou zamyslet nad tim, proc se
                         * child widgety vlastne mapuji az zde, a ne v server funkci, ktera
                         * je getuje. Pokud to pujde, je to pravdepodobne spravnejsi reseni.
                         * */
                        // const childItems = item.widget.type === 'calendar' ? items.(...) : [];
                        let childWidgets: ChildWidgetData[] | undefined;
                        if (item.widget.type === 'calendar') {
                            childWidgets = items
                                .filter((other) => {
                                    // tento filter funciton by mohl mit samostanou fci kvuli citelnosti, ale je to nice to have.
                                    if (other.widgetId === item.widgetId) return false;
                                    if (!['checklist', 'spinner'].includes(other.widget.type))
                                        return false;
                                    if (item.widget.groupId) {
                                        return other.widget.groupId === item.widget.groupId;
                                    }
                                    return other.widget.visibility === 'private';
                                })
                                .map((other) => ({
                                    id: other.widgetId,
                                    type: other.widget.type,
                                    name: other.widget.name,
                                    data: other.widget.data.data,
                                }));
                        }
                        return (
                            <WidgetCard
                                key={item.id}
                                dashboardItem={item}
                                group={
                                    item.widget.groupId
                                        ? (userGroups.find((g) => g.id === item.widget.groupId) ??
                                          null)
                                        : null
                                }
                                childWidgets={childWidgets}
                            />
                        );
                    })}
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
};
