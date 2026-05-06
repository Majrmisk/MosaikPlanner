'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GroupWithMembers } from '@/modules/groups/schemas';
import { GroupCard } from './group-card';
import { GroupFormDialog } from './group-form-dialog';
import { JoinGroupDialog } from './join-group-dialog';

type GroupsPageProps = {
    groups: GroupWithMembers[];
    currentUserId: string;
};

export function GroupsPage({ groups, currentUserId }: GroupsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <section className="flex flex-col items-center gap-3">
                <Button size="lg" className="w-full max-w-sm" onClick={() => setCreateOpen(true)}>
                    Create group
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full max-w-sm"
                    onClick={() => setJoinOpen(true)}
                >
                    Join group
                </Button>
            </section>

            <section>
                {groups.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                        <Users className="size-8" />
                        <p className="text-sm">You are not in any groups yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <GroupCard key={group.id} group={group} currentUserId={currentUserId} />
                        ))}
                    </div>
                )}
            </section>

            <GroupFormDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />
            <JoinGroupDialog open={joinOpen} onOpenChange={setJoinOpen} />
        </div>
    );
}
