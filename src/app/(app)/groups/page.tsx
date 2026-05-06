import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getGroupsWithMembersByUserId } from '@/modules/groups/queries';
import { GroupsPage } from '@/modules/groups/components';

export const metadata: Metadata = {
    title: 'Mosaik | Groups',
};

export default async function GroupsPageRoute() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/');
    }

    const groups = await getGroupsWithMembersByUserId(session.user.id);

    return <GroupsPage groups={groups} currentUserId={session.user.id} />;
}
