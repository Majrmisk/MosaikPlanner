import { CalendarDays } from 'lucide-react';
import type { WidgetPreviewProps } from '../widget-card';
import type { ChecklistItem } from '@/modules/widgets/schemas';

export function ChecklistPreview({ data }: WidgetPreviewProps) {
    let items: ChecklistItem[] = [];
    try {
        const parsed = JSON.parse(data) as { items: ChecklistItem[] };
        items = parsed.items ?? [];
    } catch {}

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
                {items.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <div
                            className={`size-3 shrink-0 rounded-sm border ${item.completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                        />
                        <span
                            className={`truncate text-xs ${item.completed ? 'text-muted-foreground line-through' : ''}`}
                        >
                            {item.text}
                        </span>
                        {item.dueDate && (
                            <span className="ml-auto shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarDays className="size-3" />
                                {new Date(item.dueDate).toLocaleDateString('cs-CZ', {
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </span>
                        )}
                    </div>
                ))}
                {items.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{items.length - 5} more</p>
                )}
            </div>
        </div>
    );
}
