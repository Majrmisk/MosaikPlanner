import { relations, sql } from 'drizzle-orm';
import { check, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { groupsTable } from './groups';
import { widgetDataTable } from './widget-data';

export type WidgetType = 'notes' | 'calendar' | 'checklist' | 'spinner' | 'expenses';
export type WidgetVisibility = 'private' | 'group';

export const widgetsTable = sqliteTable(
    'widgets',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        groupId: text('group_id').references(() => groupsTable.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        type: text('type').$type<WidgetType>().notNull(),
        visibility: text('visibility').$type<WidgetVisibility>().notNull(),
        dataId: text('data_id')
            .notNull()
            .references(() => widgetDataTable.id, { onDelete: 'cascade' }),
    },
    (table) => [
        check(
            'widgets_visibility_group_id_check',
            sql`(
                (${table.visibility} = 'private' AND ${table.groupId} IS NULL) OR
                (${table.visibility} = 'group' AND ${table.groupId} IS NOT NULL)
            )`,
        ),
    ],
);

export const widgetsRelations = relations(widgetsTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [widgetsTable.groupId],
        references: [groupsTable.id],
    }),
    widgetData: one(widgetDataTable, {
        fields: [widgetsTable.dataId],
        references: [widgetDataTable.id],
    }),
}));

export type Widget = typeof widgetsTable.$inferSelect;
