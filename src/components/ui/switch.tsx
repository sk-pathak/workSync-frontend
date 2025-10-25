import { memo, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

export const Switch = memo(forwardRef<HTMLDivElement, SwitchProps>(
  ({ 
    checked, 
    onCheckedChange, 
    disabled = false, 
    className = '',
    size = 'md',
    label,
    description,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-14',
    };

    const thumbSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const switchComponent = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-input',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
            thumbSizeClasses[size],
            checked ? (size === 'sm' ? 'translate-x-4' : size === 'md' ? 'translate-x-5' : 'translate-x-7') : 'translate-x-0'
          )}
        />
      </button>
    );

    if (label || description) {
      return (
        <div ref={ref} className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50">
          <div className="space-y-1">
            {label && (
              <label className="text-text-primary font-medium cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-text-secondary text-sm">
                {description}
              </p>
            )}
          </div>
          {switchComponent}
        </div>
      );
    }

    return (
      <div ref={ref}>
        {switchComponent}
      </div>
    );
  }
));

Switch.displayName = 'Switch'; 