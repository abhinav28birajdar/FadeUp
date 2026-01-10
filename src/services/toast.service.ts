import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

export class ToastService {
  static show(type: ToastType, options: ToastOptions): void {
    Toast.show({
      type,
      text1: options.title,
      text2: options.message,
      visibilityTime: options.duration || 3000,
      position: 'top',
      topOffset: 50,
    });
  }

  static success(title: string, message?: string): void {
    this.show('success', { title, message });
  }

  static error(title: string, message?: string): void {
    this.show('error', { title, message });
  }

  static info(title: string, message?: string): void {
    this.show('info', { title, message });
  }

  static hide(): void {
    Toast.hide();
  }
}

// Export instance for backwards compatibility
export const toastService = ToastService;
