'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { joinGroupAction } from '@/modules/groups/actions';
import { joinGroupSchema } from '@/modules/groups/schemas';

type JoinGroupFormValues = z.infer<typeof joinGroupSchema>;

type JoinGroupDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function JoinGroupDialog({ open, onOpenChange }: JoinGroupDialogProps) {
    const [error, setError] = useState<string | null>(null);

    const form = useForm<JoinGroupFormValues>({
        resolver: zodResolver(joinGroupSchema),
        defaultValues: { groupName: '', password: '' },
    });

    const onSubmit = async (values: JoinGroupFormValues) => {
        setError(null);
        try {
            await joinGroupAction(values);
            form.reset();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    const pending = form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join existing group</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="join-name">Group name</Label>
                        <Input
                            id="join-name"
                            placeholder="Enter group name"
                            autoComplete="off"
                            {...form.register('groupName')}
                        />
                        {form.formState.errors.groupName && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.groupName.message}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="join-password">Password</Label>
                        <Input
                            id="join-password"
                            type="password"
                            placeholder="Enter group password"
                            {...form.register('password')}
                        />
                        {form.formState.errors.password && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" disabled={pending} className="w-full">
                        {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Join group
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
