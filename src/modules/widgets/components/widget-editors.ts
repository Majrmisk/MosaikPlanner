import type { ComponentType } from 'react';
import type { WidgetType } from '@/lib/db/schemas/widgets';
import type { WidgetEditorProps } from './widget-editor-props';
import { NotesEditor } from './notes/notes-editor';
import { CalendarEditor } from './calendar/calendar-editor';
import { ChecklistEditor } from './checklist/checklist-editor';
import { SpinnerEditor } from './spinner/spinner-editor';
import { ExpensesEditor } from './expenses/expenses-editor';

export const widgetEditors: Partial<Record<WidgetType, ComponentType<WidgetEditorProps>>> = {
    notes: NotesEditor,
    calendar: CalendarEditor,
    checklist: ChecklistEditor,
    spinner: SpinnerEditor,
    expenses: ExpensesEditor,
};
