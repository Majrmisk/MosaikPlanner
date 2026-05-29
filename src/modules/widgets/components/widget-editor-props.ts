import type { Widget as WidgetRecord } from '@/lib/db/schemas/widgets';
import type { GroupWithMembers } from '@/modules/groups/schemas';
import type { ParsedChildWidget } from '@/modules/widgets/queries';
import type {
    NotesData,
    ChecklistData,
    SpinnerData,
    CalendarData,
    ExpensesData,
} from '@/modules/widgets/schemas';

export type { ParsedChildWidget };

type BaseEditorProps = {
    widget: WidgetRecord;
    group: GroupWithMembers | null;
};

export type NotesEditorProps = BaseEditorProps & { parsedData: NotesData };
export type ChecklistEditorProps = BaseEditorProps & { parsedData: ChecklistData };
export type SpinnerEditorProps = BaseEditorProps & { parsedData: SpinnerData };
export type CalendarEditorProps = BaseEditorProps & {
    parsedData: CalendarData;
    childWidgets: ParsedChildWidget[];
};
export type ExpensesEditorProps = BaseEditorProps & { parsedData: ExpensesData };