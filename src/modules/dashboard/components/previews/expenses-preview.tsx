'use client';

import type { WidgetPreviewProps } from '../widget-card';
import { ExpensesWidgetForm } from '@/modules/widgets/components/expenses-editor';

export const ExpensesPreview = ({ data }: WidgetPreviewProps) => {
    let initExpenses: ExpensesWidgetForm['expenses'] = [];
    try {
        const parsed = JSON.parse(data) as { expenses: ExpensesWidgetForm['expenses'] };
        initExpenses = parsed.expenses.map((e) => ({
            ...e,
            payedAt: new Date(e.payedAt),
        }));
    } catch {}

    const latestExpenses = [...initExpenses]
        .sort((a, b) => b.payedAt.getTime() - a.payedAt.getTime())
        .slice(0, 10);

    return (
        <div className="h-full overflow-hidden text-xs text-muted-foreground flex flex-col gap-1">
            <span className="font-bold">Latest expenses:</span>
            {latestExpenses.length === 0 ? (
                <span>No expenses yet</span>
            ) : (
                latestExpenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{e.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-semibold text-foreground">
                                ${e.price.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground/60">·</span>
                            <span>
                                {e.payedAt.toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
