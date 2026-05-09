import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import {Bar, BarChart, XAxis} from "recharts";
import {Expense} from "@/modules/widgets/components/expenses-editor";
import {format} from "date-fns";
import {User} from "@/modules/users/schemas";

type ExpensesChartProps = {
    expenses: Expense[];
    groupUsers: User[];

}

export const ExpensesChart = ({ expenses, groupUsers }: ExpensesChartProps) => {
    if (expenses.length === 0) {
        return (<></>);
    }

    const PAYER_COLORS = [
        "#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2"
    ];

    const chartData = calcSpent(expenses);

    const allPayerIds = [...new Set(
        chartData.flatMap(m => m.byPayer.map(p => p.payerId))
    )];
    const dynamicChartConfig = Object.fromEntries(
        allPayerIds.map((id, i) => [
            id,
            {
                label: (groupUsers.find(u => u.id === id)?.name ?? id),
                color: PAYER_COLORS[i % PAYER_COLORS.length],
            }
        ])
    ) satisfies ChartConfig;

    const barData = chartData.map(({ month, byPayer }) => ({
        month,
        ...Object.fromEntries(byPayer.map(p => [p.payerId, p.amount])),
    }));

    return (
        <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payed</p>
            <ChartContainer config={dynamicChartConfig} className="min-h-[250] max-h-50 w-full">
                <BarChart accessibilityLayer data={barData}>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <XAxis dataKey="month" />
                    {allPayerIds.map(id => (
                        <Bar
                            key={id}
                            dataKey={id}
                            stackId="a"
                            fill={`var(--color-${id})`}
                            radius={4}
                            name={groupUsers.find(u => u.id === id)?.name ?? id}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
        </>
    );
}

type MonthlySpending = {
    month: string;
    total: number;
    byPayer: { payerId: string; amount: number }[];
};

const calcSpent = (expenses: Expense[]): MonthlySpending[] => {
    const filterDate = new Date();
    filterDate.setMonth(filterDate.getMonth() - 6);

    const filtered = expenses.filter(e => new Date(e.payedAt) > filterDate);

    const byMonth = Object.groupBy(filtered, e =>
        format(new Date(e.payedAt), 'yyyy-MM')  // has to be formated like this for sorting
    );

    return Object.entries(byMonth).map(([month, exps]) => {
        const monthExpenses = exps ?? [];
        const byPayer = Object.entries(
            Object.groupBy(monthExpenses, e => e.payedBy)
        ).map(([payerId, payerExps]) => ({
            payerId,
            amount: (payerExps ?? []).reduce((sum, e) => sum + e.price, 0),
        }));

        return {
            month,
            total: monthExpenses.reduce((sum, e) => sum + e.price, 0),
            byPayer,
        };
    }).sort((a, b) => a.month.localeCompare(b.month))
        .map(a => ({
            ...a,
            month: monthNumToString(a.month),
        }));
}

const monthNumToString = (monthNum: string): string => {
    const parsed_month = monthNum.slice(-2);
    switch (parsed_month) {
        case "01":
            return "Jan";
        case "02":
            return "Feb";
        case "03":
            return "Mar";
        case "04":
            return "Apr";
        case "05":
            return "May";
        case "06":
            return "Jun";
        case "07":
            return "Jul";
        case "08":
            return "Aug";
        case "09":
            return "Sep";
        case "10":
            return "Oct";
        case "11":
            return "Nov";
        case "12":
            return "Dec";
        default:
            return "?";
    }
}