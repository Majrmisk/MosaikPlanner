import type { Metadata } from 'next';
import { DarkModeToggle } from './dark-mode-toggle';

export const metadata: Metadata = {
    title: 'Mosaik | Settings',
};

export default function SettingsPage() {
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <span className="text-sm font-medium">Dark mode</span>
                <DarkModeToggle />
            </div>
        </div>
    );
}
