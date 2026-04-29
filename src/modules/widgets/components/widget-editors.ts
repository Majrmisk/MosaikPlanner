import type { ComponentType } from 'react';
import type { WidgetType } from '@/lib/db/schemas/widgets';
import type { WidgetEditorProps } from './widget-editor-props';
import { NotesEditor } from './notes-editor';

export const widgetEditors: Partial<Record<WidgetType, ComponentType<WidgetEditorProps>>> = {
    notes: NotesEditor,
    // TODO calendar: CalendarEditor,
    // TODO checklist: ChecklistEditor,
    // TODO spinner: SpinnerEditor,
    // TODO expenses: ExpensesEditor,
};
