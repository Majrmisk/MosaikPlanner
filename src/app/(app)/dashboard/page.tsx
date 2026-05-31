import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
    getUserDashboardWidgets,
    buildParsedDataMap,
    getCalendarChildWidgetsMap,
} from '@/modules/dashboard/queries';
import { getAvailableGroupWidgetsForUser } from '@/modules/widgets/queries';
import { getGroupsByUserId } from '@/modules/groups/queries';
import { DashboardGrid } from '@/modules/dashboard/components/dashboard-grid';

export const revalidate = 30;

export const metadata: Metadata = {
    title: 'Mosaik | Dashboard',
};

const DashboardPage = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/');
    }

    const [widgets, availableGroupWidgets, userGroups] = await Promise.all([
        getUserDashboardWidgets(session.user.id),
        getAvailableGroupWidgetsForUser(session.user.id),
        getGroupsByUserId(session.user.id),
    ]);

    const parsedDataMap = buildParsedDataMap(widgets);
    const calendarChildWidgetsMap = getCalendarChildWidgetsMap(widgets, parsedDataMap);

    return (
        <DashboardGrid
            widgets={widgets}
            availableGroupWidgets={availableGroupWidgets}
            userGroups={userGroups}
            parsedDataMap={parsedDataMap}
            calendarChildWidgetsMap={calendarChildWidgetsMap}
        />
    );
};

export default DashboardPage;
