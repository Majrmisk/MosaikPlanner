'use client';

import { useState } from 'react';
import { Loader2, LogOut, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { leaveGroupAction } from '@/modules/groups/actions';
import type { GroupWithMembers } from '@/modules/groups/schemas';
import { GroupFormDialog } from './group-form-dialog';
import { useMutation } from '@tanstack/react-query';

type GroupCardProps = {
    group: GroupWithMembers;
    currentUserId: string;
};

export function GroupCard({ group, currentUserId }: GroupCardProps) {
    const [editOpen, setEditOpen] = useState(false);

    const leaveGroupMutation = useMutation({
        mutationFn: () => leaveGroupAction({ groupId: group.id }),
    });

    const handleLeave = async () => {
        await leaveGroupMutation.mutateAsync();
    };

    const isLastMember = group.members.length === 1;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: group.color }}
                        />
                        <CardTitle className="text-base font-semibold">{group.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditOpen(true)}
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                    disabled={leaveGroupMutation.isPending}
                                >
                                    {leaveGroupMutation.isPending ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <LogOut className="size-3.5" />
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Leave &quot;{group.name}&quot;?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {isLastMember
                                            ? 'You are the last member. Leaving will permanently delete the group and all its data.'
                                            : 'The groups widgets will be removed from your dashboard.'}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLeave}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Leave
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                {leaveGroupMutation.isError && (
                    <p className="px-6 pb-2 text-xs text-destructive">Failed to leave group</p>
                )}
                <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                        {group.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-1.5">
                                <Avatar className="size-6">
                                    <AvatarImage
                                        src={member.image ?? undefined}
                                        alt={member.name ?? 'Member'}
                                    />
                                    <AvatarFallback />
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                    {member.name ?? member.email}
                                    {member.id === currentUserId && (
                                        <span className="ml-1 text-xs text-foreground/40">
                                            (you)
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <GroupFormDialog mode="edit" group={group} open={editOpen} onOpenChange={setEditOpen} />
        </>
    );
}
