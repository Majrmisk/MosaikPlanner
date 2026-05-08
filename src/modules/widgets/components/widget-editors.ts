import type { ComponentType } from 'react';
import type { WidgetType } from '@/lib/db/schemas/widgets';
import type { WidgetEditorProps } from './widget-editor-props';
import { NotesEditor } from './notes-editor';
import { CalendarEditor } from './calendar-editor';
import { ChecklistEditor } from './checklist-editor';
import { SpinnerEditor } from './spinner-editor';

export const widgetEditors: Partial<Record<WidgetType, ComponentType<WidgetEditorProps>>> = {
    notes: NotesEditor,
    calendar: CalendarEditor,
    checklist: ChecklistEditor,
    spinner: SpinnerEditor,
    // TODO expenses: ExpensesEditor,
};
