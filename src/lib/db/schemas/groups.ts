import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const groupsTable = sqliteTable('groups', {
    id: integer('id').primaryKey({ autoIncrement: true }),
});

export type Group = typeof groupsTable.$inferSelect;
export type NewGroup = typeof groupsTable.$inferInsert;

// groups
// - id PK
// - name NOT NULL
// - password_hash NOT NULL
// - created_by_user_id FK -> users.id NOT NULL
// - color NOT NULL

// group_members    -- create with relations
// - id PK
// - group_id FK -> groups.id NOT NULL
// - user_id FK -> users.id NOT NULL

// Constraints:
// - UNIQUE (group_id, user_id)
