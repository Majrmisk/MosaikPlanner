import { z } from 'zod';
import { userIdSchema } from '@/modules/users/schemas';
import { widgetDataSchema, widgetIdSchema, widgetSchema } from '@/modules/widgets/schemas';

const idSchema = z.uuid();

export const dashboardItemIdSchema = idSchema;
export const dashboardItemOrderIndexSchema = z.number().int().min(0);

export const dashboardItemSchema = z.object({
    id: dashboardItemIdSchema,
    userId: userIdSchema,
    widgetId: widgetIdSchema,
    orderIndex: dashboardItemOrderIndexSchema,
});

export const dashboardWidgetSchema = dashboardItemSchema.extend({
    widget: widgetSchema.extend({
        data: widgetDataSchema,
    }),
});

export const moveDashboardWidgetSchema = z.object({
    widgetId: widgetIdSchema,
    orderIndex: dashboardItemOrderIndexSchema,
});

export type DashboardItem = z.infer<typeof dashboardItemSchema>;
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type MoveDashboardWidgetInput = z.infer<typeof moveDashboardWidgetSchema>;
