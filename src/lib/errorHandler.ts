import { toast } from '@/hooks/use-toast';

export interface ErrorInfo {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ErrorHandler {
  static showError(error: Error | string, title?: string) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorTitle = title || 'Something went wrong';
    
    toast({
      title: errorTitle,
      description: errorMessage,
      variant: 'destructive',
    });
  }

  static showWarning(message: string, title?: string) {
    toast({
      title: title || 'Warning',
      description: message,
      variant: 'default',
    });
  }

  static showInfo(message: string, title?: string) {
    toast({
      title: title || 'Information',
      description: message,
      variant: 'default',
    });
  }

  static showSuccess(message: string, title?: string) {
    toast({
      title: title || 'Success',
      description: message,
      variant: 'default',
    });
  }

  static showNetworkError() {
    toast({
      title: 'Connection Lost',
      description: 'Unable to connect to the server. Please check your internet connection.',
      variant: 'destructive',
    });
  }

  static showNetworkRestored() {
    toast({
      title: 'Connection Restored',
      description: 'You are back online and connected to the server.',
      variant: 'default',
    });
  }

  static showAuthError(error?: string) {
    toast({
      title: 'Authentication Failed',
      description: error || 'Please check your credentials and try again.',
      variant: 'destructive',
    });
  }

  static showWebSocketError(error?: string) {
    toast({
      title: 'Real-time Connection Failed',
      description: error || 'Unable to establish real-time connection. Chat features may be limited.',
      variant: 'destructive',
    });
  }

  static showWebSocketConnected() {
    toast({
      title: 'Real-time Connected',
      description: 'Real-time features are now available.',
      variant: 'default',
    });
  }

  static handleApiError(error: any, context?: string) {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Server error occurred';
      
      switch (status) {
        case 401:
          this.showAuthError(message);
          break;
        case 403:
          this.showError(message, 'Access Denied');
          break;
        case 404:
          this.showError(message, 'Not Found');
          break;
        case 500:
          this.showError(message, 'Server Error');
          break;
        default:
          this.showError(message, `Error ${status}`);
      }
    } else if (error.request) {
      this.showNetworkError();
    } else {
      this.showError(error.message || 'An unexpected error occurred');
    }
  }

  static handleWebSocketError(error: any) {
    console.error('WebSocket Error:', error);
    this.showWebSocketError(error.message || 'Connection failed');
  }
}