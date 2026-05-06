import { Loader2 } from 'lucide-react';

export default function GroupsLoading() {
    return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
    );
}
