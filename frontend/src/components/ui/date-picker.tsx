"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled = false,
  className,
  error = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert string value to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    // Parse YYYY-MM-DD string
    const parsed = new Date(value + "T00:00:00");
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  // Get default month to show (prioritize value, then maxDate for birthdays)
  const defaultMonth = React.useMemo(() => {
    if (dateValue) return dateValue;
    if (maxDate) return maxDate;
    return new Date();
  }, [dateValue, maxDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-left border rounded-xl outline-none transition-all",
            "bg-white hover:bg-gray-50",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            className
          )}
        >
          <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className={cn(dateValue ? "text-gray-900" : "text-gray-400")}>
            {dateValue ? format(dateValue, "dd MMM yyyy") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <div className="date-picker-calendar">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            defaultMonth={defaultMonth}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            className="p-3"
            classNames={{
              months: "flex flex-col sm:flex-row gap-2",
              month: "flex flex-col gap-4",
              caption: "flex justify-center pt-1 relative items-center w-full",
              caption_label: "text-sm font-semibold text-gray-900",
              nav: "flex items-center gap-1",
              nav_button: cn(
                "inline-flex items-center justify-center rounded-lg",
                "size-8 bg-transparent p-0 text-gray-600",
                "hover:bg-teal-50 hover:text-teal-600",
                "transition-colors"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-9 font-medium text-xs",
              row: "flex w-full mt-1",
              cell: cn(
                "relative p-0.5 text-center text-sm focus-within:relative focus-within:z-20",
                "[&:has([aria-selected])]:bg-teal-50 [&:has([aria-selected])]:rounded-lg"
              ),
              day: cn(
                "inline-flex items-center justify-center rounded-lg",
                "size-8 p-0 font-normal text-gray-700",
                "hover:bg-teal-50 hover:text-teal-700",
                "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1",
                "transition-colors",
                "aria-selected:opacity-100"
              ),
              day_selected: cn(
                "bg-teal-500 text-white",
                "hover:bg-teal-600 hover:text-white",
                "focus:bg-teal-600 focus:text-white"
              ),
              day_today: "bg-gray-100 text-gray-900 font-semibold",
              day_outside: "text-gray-300 aria-selected:text-white/70",
              day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
              day_hidden: "invisible",
            }}
          />
        </div>
        {/* Quick Actions Footer */}
        <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-gray-50">
          <button
            type="button"
            onClick={() => handleSelect(undefined)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
