import type { WidgetPreviewProps } from '../widget-card';

export function NotesPreview({ data }: WidgetPreviewProps) {
    let content = '';
    try {
        const parsed = JSON.parse(data) as { content: string };
        content = parsed.content;
    } catch {}
    return (
        <p className="h-full overflow-hidden whitespace-pre-wrap break-words text-xs text-muted-foreground">
            {content || 'Empty note'}
        </p>
    );
}
