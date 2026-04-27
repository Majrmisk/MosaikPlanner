import { z } from 'zod';
import type { WidgetType, WidgetVisibility } from '@/lib/db/schemas/widgets';
import { groupIdSchema } from '@/modules/groups/schemas';

const idSchema = z.uuid();

export const widgetIdSchema = idSchema;
export const widgetDataIdSchema = idSchema;
export const widgetNameSchema = z.string().trim().min(1).max(100);
export const widgetTypeSchema = z.enum(['notes', 'calendar', 'checklist', 'spinner', 'expenses']);
export const widgetVisibilitySchema = z.enum(['private', 'group']);
export const widgetDataContentSchema = z.string().min(1);

///
// TODO once widget components data needs are known, add schemas here
///

export const widgetDataSchema = z.object({
    id: widgetDataIdSchema,
    data: widgetDataContentSchema,
});

export const createWidgetDataSchema = z.object({
    data: widgetDataContentSchema,
});

export const updateWidgetDataSchema = z.object({
    data: widgetDataContentSchema,
});

export const widgetSchema = z.object({
    id: widgetIdSchema,
    groupId: groupIdSchema.nullable(),
    name: widgetNameSchema,
    type: widgetTypeSchema,
    visibility: widgetVisibilitySchema,
    dataId: widgetDataIdSchema,
});

export const createWidgetSchema = z.object({
    groupId: groupIdSchema.nullable(),
    name: widgetNameSchema,
    type: widgetTypeSchema,
    visibility: widgetVisibilitySchema,
    dataId: widgetDataIdSchema,
});

export const updateWidgetSchema = z.object({
    groupId: groupIdSchema.nullable().optional(),
    name: widgetNameSchema.optional(),
    type: widgetTypeSchema.optional(),
    visibility: widgetVisibilitySchema.optional(),
    dataId: widgetDataIdSchema.optional(),
});

export type Widget = z.infer<typeof widgetSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;

export type WidgetData = z.infer<typeof widgetDataSchema>;
export type CreateWidgetDataInput = z.infer<typeof createWidgetDataSchema>;
export type UpdateWidgetDataInput = z.infer<typeof updateWidgetDataSchema>;

export type { WidgetType, WidgetVisibility };
