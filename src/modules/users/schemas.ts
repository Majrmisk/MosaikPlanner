import { z } from 'zod';

const idSchema = z.uuid();

export const userIdSchema = idSchema;

export const userSchema = z.object({
    id: userIdSchema,
    name: z.string().nullable(),
    email: z.email().nullable(),
    image: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;
