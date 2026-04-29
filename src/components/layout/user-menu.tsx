'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { LogOut, Settings, ChevronDown, LayoutDashboard, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type UserMenuProps = {
    user: Session['user'];
};

export function UserMenu({ user }: UserMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                    <Avatar className="size-6">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                        <AvatarFallback />
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline-block">{user.name}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="sm:hidden">
                    <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="sm:hidden">
                    <Users className="mr-2 size-4" />
                    Groups
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem disabled>
                    <Settings className="mr-2 size-4" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
