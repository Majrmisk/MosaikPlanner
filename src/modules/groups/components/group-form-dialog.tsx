'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createGroupAction, updateGroupAction } from '@/modules/groups/actions';
import { createGroupActionSchema } from '@/modules/groups/schemas';
import type { GroupWithMembers } from '@/modules/groups/schemas';
import { ColorPicker, DEFAULT_COLOR } from './color-picker';

const formSchema = createGroupActionSchema;
type FormValues = { name: string; password: string; color: string };

type GroupFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
} & ({ mode: 'create'; group?: undefined } | { mode: 'edit'; group: GroupWithMembers });

export function GroupFormDialog({ open, onOpenChange, mode, group }: GroupFormDialogProps) {
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(
        mode === 'edit' ? group.color : DEFAULT_COLOR,
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: mode === 'edit' ? group.name : '',
            password: mode === 'edit' ? 'placeholder' : '',
            color: mode === 'edit' ? group.color : DEFAULT_COLOR,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setError(null);
        if (mode === 'create') {
            const result = await createGroupAction({ ...values, color: selectedColor });
            if ('error' in result) {
                setError(result.error);
                return;
            }
            form.reset();
            setSelectedColor(DEFAULT_COLOR);
        } else {
            const result = await updateGroupAction({
                id: group.id,
                name: values.name,
                color: selectedColor,
            });
            if ('error' in result) {
                setError(result.error);
                return;
            }
        }
        onOpenChange(false);
    };

    const pending = form.formState.isSubmitting;
    const isCreate = mode === 'create';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isCreate ? 'Create group' : 'Edit group'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="group-name">Group name</Label>
                        <Input
                            id="group-name"
                            placeholder="My group"
                            autoComplete="off"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    {isCreate && (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="group-password">Password</Label>
                            <Input
                                id="group-password"
                                type="password"
                                placeholder="Set a group password"
                                {...form.register('password')}
                            />
                            {form.formState.errors.password && (
                                <p className="text-xs text-destructive">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label>Color</Label>
                        <ColorPicker
                            value={selectedColor}
                            onChange={(color) => {
                                setSelectedColor(color);
                                form.setValue('color', color);
                            }}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" disabled={pending} className="w-full">
                        {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {isCreate ? 'Create group' : 'Save changes'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
