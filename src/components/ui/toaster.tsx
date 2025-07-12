import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}
            className="group toast neu-card bg-gradient-dark text-card-foreground shadow-neu"
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-muted-foreground">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="neu-btn" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
