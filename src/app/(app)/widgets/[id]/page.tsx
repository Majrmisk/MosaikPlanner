import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { getWidgetById, getWidgetDataById } from '@/modules/widgets/repository';
import { getDashboardItemByUserIdAndWidgetId } from '@/modules/dashboard/repository';
import { getGroupById, getIsUserInGroup } from '@/modules/groups/queries';
import { getCalendarChildWidgets } from '@/modules/widgets/queries';
import { widgetEditors } from '@/modules/widgets/components/widget-editors';
type WidgetPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: WidgetPageProps): Promise<Metadata> {
    const { id } = await params;
    const widget = await getWidgetById(id);

    return {
        title: widget ? `Mosaik | ${widget.name}` : 'Widget not found',
    };
}

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
        widget.groupId ? getGroupById(widget.groupId) : Promise.resolve(null),
    ]);
    if (!widgetData) {
        notFound();
    }

    const Editor = widgetEditors[widget.type];

    if (Editor) {
        const childWidgets =
            widget.type === 'calendar'
                ? await getCalendarChildWidgets(widget.id, session.user.id)
                : undefined;
        return (
            <Editor
                widget={widget}
                widgetData={widgetData}
                group={group}
                childWidgets={childWidgets}
            />
        );
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
