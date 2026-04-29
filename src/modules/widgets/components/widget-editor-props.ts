import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { WidgetData as WidgetDataRecord } from '@/lib/db/schemas/widget-data';

export type WidgetEditorProps = {
    widget: WidgetRecord;
    widgetData: WidgetDataRecord;
};
