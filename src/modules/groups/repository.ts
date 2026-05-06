import 'server-only';

import { and, count, eq } from 'drizzle-orm';
import { db, groupMembersTable, groupsTable, users } from '@/lib/db';
import type {
    Group as GroupRecord,
    GroupMember as GroupMemberRecord,
} from '@/lib/db/schemas/groups';
import type { User } from '@/modules/users/schemas';
import type { CreateGroupMemberInput, CreateGroupInput, Group, UpdateGroupInput } from './schemas';

export const getGroupById = async (groupId: string): Promise<GroupRecord | undefined> => {
    return db.query.groupsTable.findFirst({
        where: (table, { eq }) => eq(table.id, groupId),
    });
};

export const getGroupByName = async (groupName: string): Promise<GroupRecord | undefined> => {
    return db.query.groupsTable.findFirst({
        where: (table, { eq }) => eq(table.name, groupName),
    });
};

export const createGroup = async (data: CreateGroupInput): Promise<GroupRecord> => {
    const [group] = await db.insert(groupsTable).values(data).returning();

    if (!group) {
        throw new Error('Failed to create group');
    }

    return group;
};

export const updateGroup = async (
    groupId: string,
    data: UpdateGroupInput,
): Promise<GroupRecord> => {
    const [group] = await db
        .update(groupsTable)
        .set(data)
        .where(eq(groupsTable.id, groupId))
        .returning();

    if (!group) {
        throw new Error('Failed to update group');
    }

    return group;
};

export const getGroupMember = async (
    groupId: string,
    userId: string,
): Promise<GroupMemberRecord | undefined> => {
    return db.query.groupMembersTable.findFirst({
        where: (table, { and, eq }) => and(eq(table.groupId, groupId), eq(table.userId, userId)),
    });
};

export const isUserInGroup = async (groupId: string, userId: string): Promise<boolean> => {
    const membership = await getGroupMember(groupId, userId);
    return membership !== undefined;
};

export const addGroupMember = async (data: CreateGroupMemberInput): Promise<GroupMemberRecord> => {
    const [membership] = await db.insert(groupMembersTable).values(data).returning();

    if (!membership) {
        throw new Error('Failed to add group member');
    }

    return membership;
};

export const removeGroupMember = async (
    groupId: string,
    userId: string,
): Promise<GroupMemberRecord | undefined> => {
    const [membership] = await db
        .delete(groupMembersTable)
        .where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId)))
        .returning();

    return membership;
};

export const getUsersByGroupId = async (groupId: string): Promise<User[]> => {
    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
        })
        .from(groupMembersTable)
        .innerJoin(users, eq(groupMembersTable.userId, users.id))
        .where(eq(groupMembersTable.groupId, groupId));
};

export const deleteGroup = async (groupId: string): Promise<void> => {
    await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
};

export const getGroupMemberCount = async (groupId: string): Promise<number> => {
    const [result] = await db
        .select({ count: count() })
        .from(groupMembersTable)
        .where(eq(groupMembersTable.groupId, groupId));

    return result?.count ?? 0;
};

export const getGroupsByUserId = async (userId: string): Promise<Group[]> => {
    return db
        .select({
            id: groupsTable.id,
            name: groupsTable.name,
            createdByUserId: groupsTable.createdByUserId,
            color: groupsTable.color,
        })
        .from(groupMembersTable)
        .innerJoin(groupsTable, eq(groupMembersTable.groupId, groupsTable.id))
        .where(eq(groupMembersTable.userId, userId));
};
