import 'server-only';

import type { DashboardWidget } from './schemas';
import { getDashboardWidgetsByUserId } from './repository';
import { parseWidgetData, type ParsedWidgetData } from '@/modules/widgets/queries';
import { ChildWidget } from '@/modules/widgets/schemas';

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

const widgetIsChild = (calendar: DashboardWidget, widget: DashboardWidget) => {
    if (widget.widgetId === calendar.widgetId) return false;
    if (!['checklist', 'spinner'].includes(widget.widget.type)) return false;
    if (widget.widget.groupId) {
        return widget.widget.groupId === calendar.widget.groupId;
    }
    return widget.widget.visibility === 'private';
};

export const getCalendarChildWidgetsMap = (
    widgets: DashboardWidget[],
    parsedDataMap: Record<string, ParsedWidgetData>,
) => {
    const calendarChildWidgetsMap: Record<string, ChildWidget[]> = Object.fromEntries(
        widgets
            .filter((widget) => widget.widget.type === 'calendar')
            .map((widget) => [
                widget.widgetId,
                widgets
                    .filter((other) => widgetIsChild(widget, other))
                    .map((child) => ({
                        id: child.widgetId,
                        parsedData: parsedDataMap[child.widgetId] ?? null,
                    })),
            ]),
    );

    return calendarChildWidgetsMap;
};
