import type { ComponentType } from 'react';
import type { WidgetType } from '@/lib/db/schemas/widgets';
import type { WidgetEditorProps } from './widget-editor-props';
import { NotesEditor } from './notes-editor';
import { SpinnerEditor } from './spinner-editor';

export const widgetEditors: Partial<Record<WidgetType, ComponentType<WidgetEditorProps>>> = {
    notes: NotesEditor,
    spinner: SpinnerEditor,
    // TODO calendar: CalendarEditor,
    // TODO checklist: ChecklistEditor,
    // TODO expenses: ExpensesEditor,
};
