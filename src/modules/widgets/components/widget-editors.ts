import type { ComponentType } from 'react';
import type { WidgetType } from '@/lib/db/schemas/widgets';
import type { WidgetEditorProps } from './widget-editor-props';
import { NotesEditor } from './notes-editor';
import { ChecklistEditor } from './checklist-editor';

export const widgetEditors: Partial<Record<WidgetType, ComponentType<WidgetEditorProps>>> = {
    notes: NotesEditor,
    // TODO calendar: CalendarEditor,
    checklist: ChecklistEditor,
    // TODO spinner: SpinnerEditor,
    // TODO expenses: ExpensesEditor,
};
