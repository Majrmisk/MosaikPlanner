import Link from 'next/link';
import type { Session } from 'next-auth';
import { UserMenu } from './user-menu';

type TopNavbarProps = {
    user: Session['user'];
};

export const TopNavbar = ({ user }: TopNavbarProps) => {
    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-lg font-bold tracking-tight">
                        MosaikPlanner
                    </Link>
                    <Link
                        href="/dashboard"
                        className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/groups"
                        className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                    >
                        Groups
                    </Link>
                </nav>
                <UserMenu user={user} />
            </div>
        </header>
    );
};
