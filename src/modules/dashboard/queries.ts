import 'server-only';

import type { DashboardWidget } from './schemas';
import { getDashboardWidgetsByUserId } from './repository';

export const getUserDashboardWidgets = async (userId: string): Promise<DashboardWidget[]> => {
    return getDashboardWidgetsByUserId(userId);
};
