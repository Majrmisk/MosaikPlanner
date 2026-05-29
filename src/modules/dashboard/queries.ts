import 'server-only';

import type { DashboardWidget } from './schemas';
import { getDashboardWidgetsByUserId } from './repository';
import { parseWidgetData, type ParsedWidgetData } from '@/modules/widgets/queries';

export const getUserDashboardWidgets = async (userId: string): Promise<DashboardWidget[]> => {
    return getDashboardWidgetsByUserId(userId);
};

export const buildParsedDataMap = (
    widgets: DashboardWidget[],
): Record<string, ParsedWidgetData> => {
    return Object.fromEntries(
        widgets.map((w) => [w.widgetId, parseWidgetData(w.widget.type, w.widget.data.data)]),
    );
};
