import type { NotesData } from '@/modules/widgets/schemas';

type NotesPreviewProps = { parsedData: NotesData };

export const NotesPreview = ({ parsedData }: NotesPreviewProps) => {
    return (
        <p className="h-full overflow-hidden whitespace-pre-wrap wrap-break-words text-xs text-muted-foreground">
            {parsedData.content || 'Empty note'}
        </p>
    );
};
