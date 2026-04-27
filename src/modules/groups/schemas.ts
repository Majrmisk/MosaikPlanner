import { z } from 'zod';
import { userIdSchema, userSchema } from '@/modules/users/schemas';

const idSchema = z.uuid();

export const groupIdSchema = idSchema;
export const groupMemberIdSchema = idSchema;

export const groupNameSchema = z.string().trim().min(1).max(100);
export const groupColorSchema = z.string().trim().min(1).max(32);
export const groupPasswordSchema = z.string().min(1).max(255);

export const groupSchema = z.object({
    id: groupIdSchema,
    name: groupNameSchema,
    createdByUserId: userIdSchema,
    color: groupColorSchema,
});

export const groupWithMembersSchema = groupSchema.extend({
    members: z.array(userSchema),
});

export const createGroupSchema = z.object({
    name: groupNameSchema,
    password: groupPasswordSchema,
    color: groupColorSchema,
});

export const createGroupRecordSchema = z.object({
    name: groupNameSchema,
    passwordSalt: z.string().min(1).max(255),
    passwordHash: z.string().min(1).max(255),
    createdByUserId: userIdSchema,
    color: groupColorSchema,
});

export const updateGroupSchema = z.object({
    id: groupIdSchema,
    name: groupNameSchema.optional(),
    color: groupColorSchema.optional(),
});

export const updateGroupRecordSchema = z.object({
    name: groupNameSchema.optional(),
    color: groupColorSchema.optional(),
});

export const joinGroupSchema = z.object({
    groupName: groupNameSchema,
    password: groupPasswordSchema,
});

export const leaveGroupSchema = z.object({
    groupId: groupIdSchema,
});

export const groupMemberSchema = z.object({
    id: groupMemberIdSchema,
    groupId: groupIdSchema,
    userId: userIdSchema,
});

export const createGroupMemberSchema = z.object({
    groupId: groupIdSchema,
    userId: userIdSchema,
});

export type Group = z.infer<typeof groupSchema>;
export type GroupWithMembers = z.infer<typeof groupWithMembersSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateGroupRecordInput = z.infer<typeof createGroupRecordSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type UpdateGroupRecordInput = z.infer<typeof updateGroupRecordSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type LeaveGroupInput = z.infer<typeof leaveGroupSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type CreateGroupMemberInput = z.infer<typeof createGroupMemberSchema>;
