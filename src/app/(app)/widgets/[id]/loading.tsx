import { Loader2 } from 'lucide-react';

const WidgetLoading = () => {
    return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
    );
};

export default WidgetLoading;
