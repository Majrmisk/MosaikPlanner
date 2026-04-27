import { db } from '@/lib/db';

export const getUserById = async (userId: string) => {
    return db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, userId),
    });
};
