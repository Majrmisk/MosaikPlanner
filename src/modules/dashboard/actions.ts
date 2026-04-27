'use server';

// TODO
// import { revalidatePath } from 'next/cache';
// import { auth } from '@/auth';
// import {
//     getDashboardItemByUserIdAndWidgetId,
// } from './repository';
// import { moveDashboardWidgetSchema } from './schemas';
// import type { DashboardItem, MoveDashboardWidgetInput } from './schemas';

// const getCurrentUserId = async (): Promise<string> => {
//     const session = await auth();
//     const userId = session?.user?.id;

//     if (!userId) {
//         throw new Error('Unauthorized');
//     }

//     return userId;
// };

// export const moveDashboardWidgetAction = async (
//     input: MoveDashboardWidgetInput,
// ): Promise<DashboardItem> => {
//     const currentUserId = await getCurrentUserId();
//     const data = moveDashboardWidgetSchema.parse(input);
//     const dashboardItem = await getDashboardItemByUserIdAndWidgetId(currentUserId, data.widgetId);

//     if (!dashboardItem) {
//         throw new Error('Dashboard widget not found');
//     }

//     const updatedDashboardItem = await updateDashboardWidgetOrder(
//         currentUserId,
//         data.widgetId,
//         data.orderIndex,
//     );

//     revalidatePath('/dashboard');

//     return {
//         id: updatedDashboardItem.id,
//         userId: updatedDashboardItem.userId,
//         widgetId: updatedDashboardItem.widgetId,
//         orderIndex: updatedDashboardItem.orderIndex,
//     };
// };
