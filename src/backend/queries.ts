'use server';

import {auth} from "@/auth";

export const getCurrentUserId = async (): Promise<string> => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    return userId;
};

