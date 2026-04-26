import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { widgetsTable } from './widgets';

export const dashboardItemsTable = sqliteTable(
    'dashboard_items',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        widgetId: text('widget_id')
            .notNull()
            .references(() => widgetsTable.id, { onDelete: 'cascade' }),
        orderIndex: integer('order_index').notNull(),
    },
    (table) => [
        uniqueIndex('dashboard_items_user_id_widget_id_idx').on(table.userId, table.widgetId),
    ],
);

export type DashboardItem = typeof dashboardItemsTable.$inferSelect;
