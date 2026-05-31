'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved';

type UseWidgetSaveMutationParams<T> = {
    mutationFn: (values: T) => Promise<void>;
    setSaveStatus: (status: SaveStatus) => void;
};

type SaveWidgetButtonProps = {
    saveStatus: SaveStatus;
    onClickAction: () => void;
};

export function useWidgetSaveMutation<T>({
    mutationFn,
    setSaveStatus,
}: UseWidgetSaveMutationParams<T>) {
    return useMutation({
        mutationFn,
        onMutate: () => setSaveStatus('saving'),
        onSuccess: () => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('idle'),
    });
}

export function SaveWidgetButton({ saveStatus, onClickAction }: SaveWidgetButtonProps) {
    return (
        <>
            {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Check className="size-3" />
                    Saved
                </span>
            )}
            <Button onClick={onClickAction} disabled={saveStatus === 'saving'} size="sm">
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
            </Button>
        </>
    );
}
