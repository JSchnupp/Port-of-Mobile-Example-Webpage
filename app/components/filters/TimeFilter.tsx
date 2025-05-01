'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type TimeRange = "week" | "month" | "year" | "custom";

interface TimeFilterProps {
  onRangeChange: (range: TimeRange, startDate?: Date, endDate?: Date) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ onRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("day");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleRangeSelect = (range: TimeRange) => {
    setSelectedRange(range);
    if (range === "custom") {
      // Don't trigger onRangeChange yet - wait for date selection
      return;
    }
    onRangeChange(range);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const newRange = {
      from: dateRange.from,
      to: dateRange.to,
    };

    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      newRange.from = date;
      newRange.to = undefined;
    } else {
      if (date < dateRange.from) {
        newRange.from = date;
        newRange.to = dateRange.from;
      } else {
        newRange.to = date;
      }
    }

    setDateRange(newRange);

    // If we have both dates, trigger the range change
    if (newRange.from && newRange.to) {
      onRangeChange("custom", newRange.from, newRange.to);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={selectedRange === "week" ? "default" : "outline"}
        onClick={() => handleRangeSelect("week")}
      >
        Week
      </Button>
      <Button
        variant={selectedRange === "month" ? "default" : "outline"}
        onClick={() => handleRangeSelect("month")}
      >
        Month
      </Button>
      <Button
        variant={selectedRange === "year" ? "default" : "outline"}
        onClick={() => handleRangeSelect("year")}
      >
        Year
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={selectedRange === "custom" ? "default" : "outline"}
            className={cn(
              "justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
            onClick={() => handleRangeSelect("custom")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {dateRange.from.toLocaleDateString()} -{" "}
                  {dateRange.to.toLocaleDateString()}
                </>
              ) : (
                dateRange.from.toLocaleDateString()
              )
            ) : (
              "Custom Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={(range) => {
              if (range?.from) handleDateSelect(range.from);
              if (range?.to) handleDateSelect(range.to);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}; 