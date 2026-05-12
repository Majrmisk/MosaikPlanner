'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export type ExpensesFilterValues = {
    type: 'all' | 'expenses' | 'reimbursements';
    minPrice: number;
    maxPrice: number | undefined;
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
};

type ExpensesFilterProps = {
    value: ExpensesFilterValues;
    onChangeAction: (value: ExpensesFilterValues) => void;
};

export const defaultExpensesFilter: ExpensesFilterValues = {
    type: 'all',
    minPrice: 0,
    maxPrice: undefined,
    dateFrom: undefined,
    dateTo: undefined,
};

export const ExpensesFilter = ({ value, onChangeAction }: ExpensesFilterProps) => {
    return (
        <div className="flex flex-row items-end gap-4">
            <div className="flex flex-1 flex-col gap-1">
                <label className="text-center text-xs font-medium">Type</label>
                <Select
                    value={value.type}
                    onValueChange={(v) =>
                        onChangeAction({ ...value, type: v as ExpensesFilterValues['type'] })
                    }
                >
                    <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="expenses">Expenses only</SelectItem>
                        <SelectItem value="reimbursements">Reimbursements only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-2 flex-col gap-2">
                <label className="text-center text-xs font-medium">Price range</label>
                <Slider
                    min={0}
                    max={500}
                    step={5}
                    value={[value.minPrice, value.maxPrice ?? 500]}
                    onValueChange={([min, max]) =>
                        onChangeAction({
                            ...value,
                            minPrice: min,
                            maxPrice: max === 500 ? undefined : max,
                        })
                    }
                />
                <div className="relative h-4 text-xs text-muted-foreground">
                    <span
                        className="absolute -translate-x-1/2"
                        style={{ left: `${(value.minPrice / 500) * 100}%` }}
                    >
                        ${value.minPrice}
                    </span>
                    <span
                        className="absolute -translate-x-1/2"
                        style={{ left: `${((value.maxPrice ?? 500) / 500) * 100}%` }}
                    >
                        {value.maxPrice !== undefined ? `$${value.maxPrice}` : '$500+'}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-1">
                <label className="text-center text-xs font-medium">Date from</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center text-xs font-normal"
                        >
                            {value.dateFrom ? value.dateFrom.toLocaleDateString() : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={value.dateFrom}
                            onSelect={(d) => onChangeAction({ ...value, dateFrom: d })}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-1 flex-col gap-1">
                <label className="text-center text-xs font-medium">Date to</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center text-xs font-normal"
                        >
                            {value.dateTo ? value.dateTo.toLocaleDateString() : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={value.dateTo}
                            onSelect={(d) => onChangeAction({ ...value, dateTo: d })}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => onChangeAction(defaultExpensesFilter)}
            >
                Reset filters
            </Button>
        </div>
    );
};
