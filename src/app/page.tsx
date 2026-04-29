import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function Home() {
    const session = await auth();

    if (session?.user) {
        redirect('/dashboard');
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    MosaikPlanner
                </h1>
                <p className="max-w-md text-muted-foreground">
                    A modular task management app.
                </p>
            </div>
            <Button asChild size="lg">
                <Link href="/api/auth/signin">Sign in with GitHub</Link>
            </Button>
        </main>
    );
}
