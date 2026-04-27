'use server';

///
// TODO revalidate more paths when needed once they are created
///

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import {
    addGroupMember,
    createGroup,
    getGroupById,
    getGroupByName,
    isUserInGroup,
    removeGroupMember,
    updateGroup,
} from './repository';
import { createGroupSchema, joinGroupSchema, leaveGroupSchema, updateGroupSchema } from './schemas';
import type {
    CreateGroupInput,
    Group,
    GroupMember,
    JoinGroupInput,
    LeaveGroupInput,
    UpdateGroupInput,
} from './schemas';

const scryptAsync = promisify(scrypt);
const passwordKeyLength = 64;
const passwordSaltBytes = 16;

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

export const createGroupAction = async (input: CreateGroupInput): Promise<Group> => {
    const currentUserId = await getCurrentUserId();
    const data = createGroupSchema.parse(input);

    const existingGroup = await getGroupByName(data.name);

    if (existingGroup) {
        throw new Error('Group already exists');
    }

    const passwordRecord = await createPasswordRecord(data.password);
    const group = await createGroup({
        name: data.name,
        color: data.color,
        createdByUserId: currentUserId,
        ...passwordRecord,
    });

    await addGroupMember({
        groupId: group.id,
        userId: currentUserId,
    });

    revalidatePath('/dashboard');

    return {
        id: group.id,
        name: group.name,
        createdByUserId: group.createdByUserId,
        color: group.color,
    };
};

export const updateGroupAction = async (input: UpdateGroupInput): Promise<Group> => {
    const currentUserId = await getCurrentUserId();
    const data = updateGroupSchema.parse(input);
    const group = await getGroupById(data.id);

    if (!group) {
        throw new Error('Group not found');
    }

    if (group.createdByUserId !== currentUserId) {
        throw new Error('Forbidden');
    }

    const updatedGroup = await updateGroup(data.id, {
        name: data.name,
        color: data.color,
    });

    revalidatePath('/dashboard');

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
        return {
            id: group.id,
            name: group.name,
            createdByUserId: group.createdByUserId,
            color: group.color,
        };
    }

    await addGroupMember({
        groupId: group.id,
        userId: currentUserId,
    });

    revalidatePath('/dashboard');

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

    const membership = await removeGroupMember(data.groupId, currentUserId);

    revalidatePath('/dashboard');

    return membership;
};
