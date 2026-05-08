import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { TopNavbar } from '@/components/layout/top-navbar';
import {SessionProvider} from "next-auth/react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    return (
        <>
            <SessionProvider session={session}>
                <TopNavbar user={session.user} />
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </SessionProvider>
        </>
    );
}
