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

    expenses.forEach((expense) => {
        const share = expense.price / expense.payedFor.length;
        expense.payedFor.forEach((p) => {
            if (p === expense.payedBy) {
                return;
            }

            const debtor = DebtsMap.get(p);
            if (debtor !== undefined) {
                const owesAmount = debtor.get(expense.payedBy) ?? 0;
                debtor.set(expense.payedBy, owesAmount + share);
            } else {
                DebtsMap.set(p, new Map([[expense.payedBy, share]]));
            }
        });
    });

    return DebtsMap;
};
