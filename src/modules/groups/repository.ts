import { and, eq } from 'drizzle-orm';
import { db, groupMembersTable, groupsTable, users } from '@/lib/db';
import {
    CreateGroupMemberInput,
    CreateGroupRecordInput,
    JoinGroupInput,
    UpdateGroupRecordInput,
} from './schemas';

export const getGroupById = async (groupId: string) => {
    return db.query.groupsTable.findFirst({
        where: (table, { eq }) => eq(table.id, groupId),
    });
};

export const getGroupByName = async (groupName: string) => {
    return db.query.groupsTable.findFirst({
        where: (table, { eq }) => eq(table.name, groupName),
    });
};

export const createGroup = async (data: CreateGroupRecordInput) => {
    const [group] = await db.insert(groupsTable).values(data).returning();
    return group;
};

export const updateGroup = async (groupId: string, data: UpdateGroupRecordInput) => {
    const [group] = await db.update(groupsTable).set(data).where(eq(groupsTable.id, groupId)).returning();
    return group;
};

export const getGroupMember = async (groupId: string, userId: string) => {
    return db.query.groupMembersTable.findFirst({
        where: (table, { and, eq }) => and(eq(table.groupId, groupId), eq(table.userId, userId)),
    });
};

export const isUserInGroup = async (groupId: string, userId: string) => {
    const membership = await getGroupMember(groupId, userId);
    return membership !== undefined;
};

export const addGroupMember = async (data: CreateGroupMemberInput) => {
    const [membership] = await db.insert(groupMembersTable).values(data).returning();
    return membership;
};

export const removeGroupMember = async (groupId: string, userId: string) => {
    const [membership] = await db
        .delete(groupMembersTable)
        .where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId)))
        .returning();

    return membership;
};

export const getUsersByGroupId = async (groupId: string) => {
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

export const getGroupsByUserId = async (userId: string) => {
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
