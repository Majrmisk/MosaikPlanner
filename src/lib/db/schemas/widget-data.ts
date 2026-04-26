import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const widgetDataTable = sqliteTable('widget_data', {
    id: integer('id').primaryKey({ autoIncrement: true }),
});

export type WidgetData = typeof widgetDataTable.$inferSelect;

// widgets_data    -- one data per one widget
// - id PK
// - data JSON NOT NULL
