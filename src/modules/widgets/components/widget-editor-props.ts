import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { WidgetData as WidgetDataRecord } from '@/lib/db/schemas/widget-data';
import { GroupWithMembers } from '@/modules/groups/schemas';
import type { ChildWidget } from '@/modules/widgets/queries';

export type { ChildWidget };

export type WidgetEditorProps = {
    widget: WidgetRecord;
    widgetData: WidgetDataRecord;
    group: GroupWithMembers | null;
    childWidgets?: ChildWidget[];
};
