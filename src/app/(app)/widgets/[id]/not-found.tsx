import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WidgetNotFound() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <h1 className="text-2xl font-bold">Widget not found</h1>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Back to dashboard
            </Link>
        </div>
    );
}
