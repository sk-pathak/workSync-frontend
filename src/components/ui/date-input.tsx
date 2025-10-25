import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value;
      if (dateValue) {
        onChange?.(new Date(dateValue));
      } else {
        onChange?.(undefined);
      }
    };

    const formatValue = () => {
      if (!value) return '';
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return (
      <input
        ref={ref}
        type="date"
        value={formatValue()}
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

DateInput.displayName = 'DateInput';
