'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardWidget } from '@/modules/dashboard/schemas';
import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { Group } from '@/modules/groups/schemas';
import { WidgetCard } from './widget-card';
import { AddWidgetDialog } from './add-widget-dialog';

type DashboardGridProps = {
    widgets: DashboardWidget[];
    availableGroupWidgets: WidgetRecord[];
    userGroups: Group[];
};

export function DashboardGrid({ widgets, availableGroupWidgets, userGroups }: DashboardGridProps) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    return (
        <div className="flex flex-wrap justify-center gap-4">
            {widgets.map((item) => (
                <WidgetCard
                    key={item.id}
                    dashboardItem={item}
                    data-widget-id={item.widgetId}
                    data-order-index={item.orderIndex}
                />
            ))}
            <Card
                className="flex h-68 w-64 cursor-pointer items-center justify-center border-dashed transition-colors hover:border-foreground/30 hover:bg-muted/50"
                onClick={() => setAddDialogOpen(true)}
            >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Plus className="size-8" />
                    <span className="text-sm font-medium">Add widget</span>
                </div>
            </Card>
            <AddWidgetDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                availableGroupWidgets={availableGroupWidgets}
                userGroups={userGroups}
            />
        </div>
    );
}
