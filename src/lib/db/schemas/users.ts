import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// users
// - id PK
// - email UNIQUE NOT NULL
// - username UNIQUE NOT NULL
// - password_hash NOT NULL
