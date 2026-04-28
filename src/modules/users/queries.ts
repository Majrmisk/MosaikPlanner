import 'server-only';

import { User } from './schemas';
import { getUserById as getUserRecordById } from './repository';

export const getUserById = async (userId: string): Promise<User | null> => {
    const user = await getUserRecordById(userId);

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
    };
};
