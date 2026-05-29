import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { getWidgetById, getWidgetDataById } from '@/modules/widgets/repository';
import { getDashboardItemByUserIdAndWidgetId } from '@/modules/dashboard/repository';
import { getGroupWithMembersById, getIsUserInGroup } from '@/modules/groups/queries';
import { getCalendarChildWidgets, parseWidgetData } from '@/modules/widgets/queries';
import { NotesEditor } from '@/modules/widgets/components/notes-editor';
import { ChecklistEditor } from '@/modules/widgets/components/checklist-editor';
import { SpinnerEditor } from '@/modules/widgets/components/spinner-editor';
import { CalendarEditor } from '@/modules/widgets/components/calendar-editor';
import { ExpensesEditor } from '@/modules/widgets/components/expenses-editor';

type WidgetPageProps = {
    params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: WidgetPageProps): Promise<Metadata> => {
    const { id } = await params;
    const widget = await getWidgetById(id);

    return {
        title: widget ? `Mosaik | ${widget.name}` : 'Widget not found',
    };
};

export default async function WidgetPage({ params }: WidgetPageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/');
    }

    const widget = await getWidgetById(id);
    if (!widget) {
        notFound();
    }

    if (widget.visibility === 'private') {
        const dashboardItem = await getDashboardItemByUserIdAndWidgetId(session.user.id, widget.id);
        if (!dashboardItem) {
            notFound();
        }
    }

    if (widget.visibility === 'group' && widget.groupId) {
        const isMember = await getIsUserInGroup(widget.groupId, session.user.id);
        if (!isMember) {
            notFound();
        }
    }

    const [widgetData, group] = await Promise.all([
        getWidgetDataById(widget.dataId),
        widget.groupId ? getGroupWithMembersById(widget.groupId) : Promise.resolve(null),
    ]);
    if (!widgetData) {
        notFound();
    }

    const parsedData = parseWidgetData(widget.type, widgetData.data);

    switch (parsedData?.widgetType) {
        case 'notes':
            return <NotesEditor widget={widget} parsedData={parsedData.data} group={group} />;
        case 'checklist':
            return <ChecklistEditor widget={widget} parsedData={parsedData.data} group={group} />;
        case 'spinner':
            return <SpinnerEditor widget={widget} parsedData={parsedData.data} group={group} />;
        case 'calendar': {
            const childWidgets = await getCalendarChildWidgets(widget.id, session.user.id);
            return (
                <CalendarEditor
                    widget={widget}
                    parsedData={parsedData.data}
                    group={group}
                    childWidgets={childWidgets}
                />
            );
        }
        case 'expenses':
            return <ExpensesEditor widget={widget} parsedData={parsedData.data} group={group} />;
    }

    return (
        <div className="flex flex-col items-center gap-6 py-24 text-center">
            <p className="text-muted-foreground">Widget not implemented.</p>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Dashboard
            </Link>
        </div>
    );
}