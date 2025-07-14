import { memo, forwardRef } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
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
      sm: 'scale-75',
      md: 'scale-90',
      lg: 'scale-110',
    };

    const switchComponent = (
      <InputSwitch
        checked={checked}
        onChange={(e) => onCheckedChange(e.value)}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          className
        )}
        {...props}
      />
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