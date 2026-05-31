import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { Group } from '@/modules/groups/schemas';

type ExistingWidgetItemProps = {
    widget: WidgetRecord;
    group: Group | undefined;
    onAdd: (widgetId: string) => void;
};

export const ExistingWidgetItem = ({ widget, group, onAdd }: ExistingWidgetItemProps) => (
    <button
        onClick={() => onAdd(widget.id)}
        className="flex items-center justify-between rounded-md p-2 text-left text-sm transition-colors hover:bg-muted"
    >
        <span className="truncate font-medium">{widget.name}</span>
        {group && (
            <span
                className="ml-2 flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                    color: group.color,
                    borderColor: group.color,
                    backgroundColor: 'white',
                }}
            >
                {group.name}
            </span>
        )}
    </button>
);
