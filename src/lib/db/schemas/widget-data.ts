import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const widgetDataTable = sqliteTable('widget_data', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    data: text('data').notNull(),
});

export type WidgetData = typeof widgetDataTable.$inferSelect;
