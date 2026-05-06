'use server';

///
// TODO revalidate more paths when needed once they are created
///

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import {
    getDashboardItemCountByWidgetId,
    removeGroupWidgetsFromUserDashboard,
} from '@/modules/dashboard/repository';
import { deleteWidget } from '@/modules/widgets/repository';
import {
    addGroupMember,
    createGroup,
    deleteGroup,
    getGroupById,
    getGroupByName,
    getGroupMemberCount,
    isUserInGroup,
    removeGroupMember,
    updateGroup,
} from './repository';
import {
    createGroupActionSchema,
    joinGroupSchema,
    leaveGroupSchema,
    updateGroupActionSchema,
} from './schemas';
import type {
    CreateGroupActionInput,
    Group,
    GroupMember,
    JoinGroupInput,
    LeaveGroupInput,
    UpdateGroupActionInput,
} from './schemas';

const scryptAsync = promisify(scrypt);
const passwordKeyLength = 64;
const passwordSaltBytes = 16;
const groupAlreadyExistsMessage = 'Group already exists';

const isUniqueGroupNameConstraintError = (error: unknown) => {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    const maybeError = error as { code?: unknown; message?: unknown };
    const code = typeof maybeError.code === 'string' ? maybeError.code : '';
    const message = typeof maybeError.message === 'string' ? maybeError.message : '';

    return (
        (code === 'SQLITE_CONSTRAINT' || code === 'SQLITE_CONSTRAINT_UNIQUE') &&
        (message.includes('groups.name') || message.includes('groups_name_unique_idx'))
    );
};

const getCurrentUserId = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    return userId;
};

const createPasswordRecord = async (password: string) => {
    const passwordSalt = randomBytes(passwordSaltBytes).toString('hex');
    const passwordHashBuffer = (await scryptAsync(
        password,
        passwordSalt,
        passwordKeyLength,
    )) as Buffer;

    return {
        passwordSalt,
        passwordHash: passwordHashBuffer.toString('hex'),
    };
};

const verifyPassword = async (password: string, passwordSalt: string, passwordHash: string) => {
    const passwordHashBuffer = Buffer.from(passwordHash, 'hex');
    const candidateHashBuffer = (await scryptAsync(
        password,
        passwordSalt,
        passwordHashBuffer.length,
    )) as Buffer;

    return (
        candidateHashBuffer.length === passwordHashBuffer.length &&
        timingSafeEqual(candidateHashBuffer, passwordHashBuffer)
    );
};

export const createGroupAction = async (input: CreateGroupActionInput): Promise<Group> => {
    const currentUserId = await getCurrentUserId();
    const data = createGroupActionSchema.parse(input);

    const existingGroup = await getGroupByName(data.name);

    if (existingGroup) {
        throw new Error(groupAlreadyExistsMessage);
    }

    const passwordRecord = await createPasswordRecord(data.password);
    let group: Awaited<ReturnType<typeof createGroup>>;

    try {
        group = await createGroup({
            name: data.name,
            color: data.color,
            createdByUserId: currentUserId,
            ...passwordRecord,
        });
    } catch (error) {
        if (isUniqueGroupNameConstraintError(error)) {
            throw new Error(groupAlreadyExistsMessage);
        }

        throw error;
    }

    await addGroupMember({
        groupId: group.id,
        userId: currentUserId,
    });

    revalidatePath('/dashboard');
    revalidatePath('/groups');

    return {
        id: group.id,
        name: group.name,
        createdByUserId: group.createdByUserId,
        color: group.color,
    };
};

export const updateGroupAction = async (input: UpdateGroupActionInput): Promise<Group> => {
    const currentUserId = await getCurrentUserId();
    const data = updateGroupActionSchema.parse(input);
    const group = await getGroupById(data.id);

    if (!group) {
        throw new Error('Group not found');
    }

    const isMember = await isUserInGroup(data.id, currentUserId);
    if (!isMember) {
        throw new Error('Forbidden');
    }

    let updatedGroup: Awaited<ReturnType<typeof updateGroup>>;

    try {
        updatedGroup = await updateGroup(data.id, {
            name: data.name,
            color: data.color,
        });
    } catch (error) {
        if (isUniqueGroupNameConstraintError(error)) {
            throw new Error(groupAlreadyExistsMessage);
        }

        throw error;
    }

    revalidatePath('/dashboard');
    revalidatePath('/groups');

    return {
        id: updatedGroup.id,
        name: updatedGroup.name,
        createdByUserId: updatedGroup.createdByUserId,
        color: updatedGroup.color,
    };
};

export const joinGroupAction = async (input: JoinGroupInput): Promise<Group> => {
    const currentUserId = await getCurrentUserId();
    const data = joinGroupSchema.parse(input);
    const group = await getGroupByName(data.groupName);

    if (!group) {
        throw new Error('Group not found');
    }

    const passwordMatches = await verifyPassword(
        data.password,
        group.passwordSalt,
        group.passwordHash,
    );

    if (!passwordMatches) {
        throw new Error('Invalid group password');
    }

    const alreadyMember = await isUserInGroup(group.id, currentUserId);

    if (alreadyMember) {
        throw new Error('You are already a member of this group');
    }

    await addGroupMember({
        groupId: group.id,
        userId: currentUserId,
    });

    revalidatePath('/dashboard');
    revalidatePath('/groups');

    return {
        id: group.id,
        name: group.name,
        createdByUserId: group.createdByUserId,
        color: group.color,
    };
};

export const leaveGroupAction = async (
    input: LeaveGroupInput,
): Promise<GroupMember | undefined> => {
    const currentUserId = await getCurrentUserId();
    const data = leaveGroupSchema.parse(input);
    const group = await getGroupById(data.groupId);

    if (!group) {
        throw new Error('Group not found');
    }

    const removedWidgetIds = await removeGroupWidgetsFromUserDashboard(currentUserId, data.groupId);

    const membership = await removeGroupMember(data.groupId, currentUserId);

    const remaining = await getGroupMemberCount(data.groupId);
    if (remaining === 0) {
        await deleteGroup(data.groupId);
    } else {
        // Delete any widgets that now no one has on their dashboard
        for (const widgetId of removedWidgetIds) {
            const count = await getDashboardItemCountByWidgetId(widgetId);
            if (count === 0) {
                await deleteWidget(widgetId);
            }
        }
    }

    revalidatePath('/dashboard');
    revalidatePath('/groups');

    return membership;
};
