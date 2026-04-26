// import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

// export const widgetsTable = sqliteTable('widgets', {
//     id: integer('id').primaryKey({ autoIncrement: true }),
// });

// export type Widget = typeof widgetsTable.$inferSelect;

// widgets
// - id PK
// - group_id FK -> groups.id NULL     -- NULL if private widget
// - name NOT NULL
// - type NOT NULL                     -- notes, calendar, checklist, spinner, expenses
// - visibility NOT NULL               -- private, group
// - data_id FK -> widgets_data.id NOT NULL

// Constraints:
// - CHECK (
//     (visibility = 'private' AND group_id IS NULL) OR
//     (visibility = 'group' AND group_id IS NOT NULL)
//   )
