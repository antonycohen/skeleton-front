"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { useTranslation } from '@skeleton/core-translations';

export type DatePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-invalid'?: boolean;
};

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const { t } = useTranslation()
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);

  const isControlled = value !== undefined || onChange !== undefined;
  const date = isControlled ? value : internalDate;

  const handleSelect = (newDate: Date | undefined) => {
    if (!isControlled) {
      setInternalDate(newDate);
    }
    onChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          aria-invalid={ariaInvalid}
          className={className ?? "data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>{placeholder ?? t('components.datePicker.placeholder')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={handleSelect} disabled={disabled} />
      </PopoverContent>
    </Popover>
  )
}
