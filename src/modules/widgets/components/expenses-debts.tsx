import { Button } from '@/components/ui/button';
import { Expense } from '@/modules/widgets/components/expenses-editor';
import { User } from '@/modules/users/schemas';

type ExpensesDebtsProps = {
    expenses: Expense[];
    groupUsers: User[];
    loggedInUser: User;
    onSettleDebt: (toUserId: string, debtAmount: number) => void;
};

export const ExpensesDebts = ({
    expenses,
    groupUsers,
    loggedInUser,
    onSettleDebt,
}: ExpensesDebtsProps) => {
    const debts = calcDebts(expenses);
    const hasDebts = debts.size;
    if (!hasDebts) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Debts
            </p>
            {Array.from(debts.entries()).map(([debtorId, owes]) => (
                <div key={debtorId} className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                        {groupUsers.find((u) => u.id === debtorId)?.name ?? debtorId}
                    </span>
                    {Array.from(owes.entries()).map(([creditorId, amount]) => (
                        <div key={creditorId} className="flex items-center justify-between pl-3">
                            <span className="text-xs text-muted-foreground">
                                → {groupUsers.find((u) => u.id === creditorId)?.name ?? creditorId}:
                                ${amount.toFixed(2)}
                            </span>
                            {loggedInUser.id === debtorId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSettleDebt(creditorId, amount)}
                                >
                                    Pay debt
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const calcDebts = (expenses: Expense[]): Map<string, Map<string, number>> => {
    const DebtsMap = new Map<string, Map<string, number>>();

    const addDebt = (debtorId: string, creditorId: string, amount: number) => {
        if (!DebtsMap.has(debtorId)) {
            DebtsMap.set(debtorId, new Map());
        }
        const owes = DebtsMap.get(debtorId)!;
        owes.set(creditorId, (owes.get(creditorId) ?? 0) + amount);
    };

    expenses.forEach((expense) => {
        if (expense.isReimbursement) {
            const creditorId = expense.payedFor[0];
            // payedBy (A) is paying creditorId (B), reducing A's debt to B
            addDebt(expense.payedBy, creditorId, -expense.price);
        } else {
            const share = expense.price / expense.payedFor.length;
            expense.payedFor.forEach((p) => {
                if (p === expense.payedBy) return;
                addDebt(p, expense.payedBy, share);
            });
        }
    });

    // Remove zero or negative net debts, and cancel out A→B / B→A pairs
    DebtsMap.forEach((owes, debtorId) => {
        owes.forEach((amount, creditorId) => {
            const reverse = DebtsMap.get(creditorId)?.get(debtorId) ?? 0;
            if (amount <= reverse) {
                owes.delete(creditorId);
                DebtsMap.get(creditorId)?.set(debtorId, reverse - amount);
            } else {
                owes.set(creditorId, amount - reverse);
                DebtsMap.get(creditorId)?.set(debtorId, 0);
            }
        });
        // Clean up zero entries
        owes.forEach((amount, creditorId) => {
            if (amount <= 0) owes.delete(creditorId);
        });
    });

    // Remove empty debtor entries
    DebtsMap.forEach((owes, debtorId) => {
        if (owes.size === 0) DebtsMap.delete(debtorId);
    });

    return DebtsMap;
};
