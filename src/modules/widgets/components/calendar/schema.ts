import {widgetIdSchema} from "@/modules/widgets/schemas";
import z from "zod";

export const calendarManualEventSchema = z.object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(200),
    date: z.iso.date(),
});

export const updateCalendarFormSchema = z.object({
    widgetId: widgetIdSchema,
    title: z.string().trim().min(1).max(200),
    excludedWidgetIds: z.array(z.uuid()),
    manualEvents: z.array(calendarManualEventSchema),
    widgetColors: z.record(z.string(), z.string()),
});

export type CalendarManualEvent = z.infer<typeof calendarManualEventSchema>;
