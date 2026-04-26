import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const dashboardItemsTable = sqliteTable('dashboard_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
});

export type DashboardItem = typeof dashboardItemsTable.$inferSelect;

// dashboard_items
// - id PK
// - user_id FK -> users.id NOT NULL
// - widget_id FK -> widgets.id NOT NULL
// - order_index NOT NULL              -- last widget + 1 when newly added
// - created_at NOT NULL
// - updated_at NOT NULL

// Constraints:
// - UNIQUE (user_id, widget_id)
