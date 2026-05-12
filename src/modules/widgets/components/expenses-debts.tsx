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
    // Step 1: compute net balance per person.
    // Positive = creditor (is owed money), negative = debtor (owes money).
    const balance = new Map<string, number>();
    const add = (id: string, delta: number) => balance.set(id, (balance.get(id) ?? 0) + delta);

    expenses.forEach((expense) => {
        if (expense.isReimbursement) {
            // payedBy sends money to payedFor[0]
            add(expense.payedBy, expense.price);
            add(expense.payedFor[0], -expense.price);
        } else {
            const share = expense.price / expense.payedFor.length;
            add(expense.payedBy, expense.price);
            expense.payedFor.forEach((p) => add(p, -share));
        }
    });

    // Step 2: greedy cash-flow minimization (max-debtor ↔ max-creditor).
    // Ref: https://github.com/Sarvesh30112002/Cash-flow-minimizer
    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];

    balance.forEach((amount, id) => {
        if (amount > 0.001) creditors.push({ id, amount });
        else if (amount < -0.001) debtors.push({ id, amount: -amount });
    });

    const result = new Map<string, Map<string, number>>();

    while (creditors.length && debtors.length) {
        // Pick largest creditor and largest debtor
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);

        const creditor = creditors[0];
        const debtor = debtors[0];
        const settled = Math.min(creditor.amount, debtor.amount);

        if (!result.has(debtor.id)) result.set(debtor.id, new Map());
        result.get(debtor.id)!.set(creditor.id, settled);

        creditor.amount -= settled;
        debtor.amount -= settled;

        if (creditor.amount < 0.001) creditors.shift();
        if (debtor.amount < 0.001) debtors.shift();
    }

    return result;
};
