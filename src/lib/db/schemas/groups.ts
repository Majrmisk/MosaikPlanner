import { relations } from 'drizzle-orm';
import { text, sqliteTable, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const groupsTable = sqliteTable('groups', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    passwordSalt: text('password_salt').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdByUserId: text('created_by_user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    color: text('color').notNull(),
});

export const groupMembersTable = sqliteTable(
    'group_members',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        groupId: text('group_id')
            .notNull()
            .references(() => groupsTable.id, { onDelete: 'cascade' }),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
    },
    (table) => [uniqueIndex('group_members_group_id_user_id_idx').on(table.groupId, table.userId)],
);

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
    createdByUser: one(users, {
        fields: [groupsTable.createdByUserId],
        references: [users.id],
    }),
    members: many(groupMembersTable),
}));

export const groupMembersRelations = relations(groupMembersTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [groupMembersTable.groupId],
        references: [groupsTable.id],
    }),
    user: one(users, {
        fields: [groupMembersTable.userId],
        references: [users.id],
    }),
}));

export type Group = typeof groupsTable.$inferSelect;
export type GroupMember = typeof groupMembersTable.$inferSelect;
