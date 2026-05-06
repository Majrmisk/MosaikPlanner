import 'server-only';

import type { User } from '@/modules/users/schemas';
import {
    getGroupById as getGroupRecordById,
    getGroupsByUserId as getGroupRecordsByUserId,
    getUsersByGroupId,
    isUserInGroup,
} from './repository';
import type { Group, GroupWithMembers } from './schemas';

export const getGroupById = async (groupId: string): Promise<Group | null> => {
    const group = await getGroupRecordById(groupId);

    if (!group) {
        return null;
    }

    return {
        id: group.id,
        name: group.name,
        createdByUserId: group.createdByUserId,
        color: group.color,
    };
};

export const getGroupWithMembersById = async (
    groupId: string,
): Promise<GroupWithMembers | null> => {
    const group = await getGroupById(groupId);

    if (!group) {
        return null;
    }

    const members = await getUsersByGroupId(groupId);

    return {
        ...group,
        members,
    };
};

export const getGroupsByUserId = async (userId: string): Promise<Group[]> => {
    return getGroupRecordsByUserId(userId);
};

export const getGroupMembersByGroupId = async (groupId: string): Promise<User[]> => {
    return getUsersByGroupId(groupId);
};

export const getIsUserInGroup = async (groupId: string, userId: string): Promise<boolean> => {
    return isUserInGroup(groupId, userId);
};

export const getGroupsWithMembersByUserId = async (userId: string): Promise<GroupWithMembers[]> => {
    const groups = await getGroupRecordsByUserId(userId);

    return Promise.all(
        groups.map(async (group) => {
            const members = await getUsersByGroupId(group.id);
            return { ...group, members };
        }),
    );
};
