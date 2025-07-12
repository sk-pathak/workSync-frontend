import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'glass-button',
        destructive:
          'glass-button bg-red-500/20 border-red-400 text-red-100 hover:bg-red-400/30 hover:border-red-300',
        outline:
          'glass-button bg-transparent border-accent/50 text-accent hover:bg-accent/20 hover:border-accent',
        secondary:
          'glass-button bg-secondary/20 border-secondary/50 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary',
        ghost: 'glass-button bg-transparent border-transparent hover:bg-accent/20 hover:border-accent/50',
        link: 'text-primary underline-offset-4 hover:underline bg-transparent border-transparent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
