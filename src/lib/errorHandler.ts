import { toast } from 'sonner';

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
    
    toast.error(errorTitle, {
      description: errorMessage,
    });
  }

  static showWarning(message: string, title?: string) {
    toast.warning(title || 'Warning', {
      description: message,
    });
  }

  static showInfo(message: string, title?: string) {
    toast.info(title || 'Information', {
      description: message,
    });
  }

  static showSuccess(message: string, title?: string) {
    toast.success(title || 'Success', {
      description: message,
    });
  }

  static showNetworkError() {
    toast.error('Connection Lost', {
      description: 'Unable to connect to the server. Please check your internet connection.',
    });
  }

  static showNetworkRestored() {
    toast.success('Connection Restored', {
      description: 'You are back online and connected to the server.',
    });
  }

  static showAuthError(error?: string) {
    toast.error('Authentication Failed', {
      description: error || 'Please check your credentials and try again.',
    });
  }

  static showWebSocketError(error?: string) {
    toast.error('Real-time Connection Failed', {
      description: error || 'Unable to establish real-time connection. Chat features may be limited.',
    });
  }

  static showWebSocketConnected() {
    toast.success('Real-time Connected', {
      description: 'Real-time features are now available.',
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