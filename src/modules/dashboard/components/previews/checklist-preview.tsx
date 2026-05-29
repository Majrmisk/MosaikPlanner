'use client';

import { CalendarDays } from 'lucide-react';
import type { ChecklistData } from '@/modules/widgets/schemas';

type ChecklistPreviewProps = { parsedData: ChecklistData };

export const ChecklistPreview = ({ parsedData }: ChecklistPreviewProps) => {
    const { items } = parsedData;

    if (items.length === 0) {
        return <p className="text-xs text-muted-foreground">Empty checklist</p>;
    }

    const completed = items.filter((i) => i.completed).length;

    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">
                {completed}/{items.length} done
            </p>
            <div className="flex flex-col gap-1">
                {items.slice(0, 5).map((item) => {
                    const formattedDate = item.dueDate
                        ? new Date(item.dueDate).toLocaleDateString('cs-CZ', {
                              day: 'numeric',
                              month: 'short',
                          })
                        : null;
                    return (
                        <div key={item.id} className="flex items-center gap-2">
                            <div
                                className={`size-3 shrink-0 rounded-sm border ${item.completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                            />
                            <span
                                className={`truncate text-xs ${item.completed ? 'text-muted-foreground line-through' : ''}`}
                            >
                                {item.text}
                            </span>
                            {formattedDate && (
                                <span className="ml-auto shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarDays className="size-3" />
                                    {formattedDate}
                                </span>
                            )}
                        </div>
                    );
                })}
                {items.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{items.length - 5} more</p>
                )}
            </div>
        </div>
    );
};