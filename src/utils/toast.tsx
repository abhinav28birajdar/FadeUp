/**
 * Toast notification system for the app
 * Provides standardized feedback to users via toast notifications
 */
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from 'tailwindcss/colors';
import { logger } from './logger';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  duration?: number;
  type?: ToastType;
  action?: {
    text: string;
    onPress: () => void;
  };
  onClose?: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: {
    text: string;
    onPress: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  show: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
}

const DEFAULT_DURATION = 3000; // 3 seconds

const ToastContext = createContext<ToastContextType>({
  show: () => '',
  success: () => '',
  error: () => '',
  info: () => '',
  warning: () => '',
  hide: () => {},
  hideAll: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider = ({ children, maxToasts = 3 }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      logger.debug('Showing toast', { message, type: options?.type || 'info', id });
      
      const newToast: Toast = {
        id,
        message,
        type: options?.type || 'info',
        duration: options?.duration || DEFAULT_DURATION,
        action: options?.action,
        onClose: options?.onClose,
      };

      setToasts((currentToasts) => {
        // If we're at the max, remove the oldest toast
        if (currentToasts.length >= maxToasts) {
          return [...currentToasts.slice(1), newToast];
        }
        return [...currentToasts, newToast];
      });

      // Auto-dismiss after duration (unless it's an error)
      if (newToast.type !== 'error' && newToast.duration > 0) {
        setTimeout(() => {
          hide(id);
        }, newToast.duration);
      }

      return id;
    },
    [maxToasts]
  );
  
  // Helper functions for specific toast types
  const success = useCallback((message: string, options?: ToastOptions) => {
    return show(message, { ...options, type: 'success' });
  }, [show]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    return show(message, { ...options, type: 'error' });
  }, [show]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    return show(message, { ...options, type: 'info' });
  }, [show]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return show(message, { ...options, type: 'warning' });
  }, [show]);

  const hide = useCallback((id: string) => {
    setToasts((currentToasts) => {
      const toastToRemove = currentToasts.find(toast => toast.id === id);
      if (toastToRemove?.onClose) {
        toastToRemove.onClose();
      }
      return currentToasts.filter((toast) => toast.id !== id);
    });
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning, hide, hideAll }}>
      {children}
      <View 
        style={[
          styles.container, 
          { backgroundColor: 'transparent' }
        ]}
      >
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => hide(toast.id)} 
            isDark={isDark}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
  isDark: boolean;
}

const ToastItem = ({ toast, onClose, isDark }: ToastItemProps) => {
  const { id, message, type, action } = toast;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Clean up animations
      opacity.setValue(0);
      translateY.setValue(20);
    };
  }, [opacity, translateY]);

  // Get the background color based on the type and theme
  const getBackgroundColor = () => {
    if (isDark) {
      switch (type) {
        case 'success': return colors.green[800];
        case 'error': return colors.red[800];
        case 'warning': return colors.amber[800];
        case 'info': return colors.blue[800];
        default: return colors.gray[800];
      }
    } else {
      switch (type) {
        case 'success': return colors.green[100];
        case 'error': return colors.red[100];
        case 'warning': return colors.amber[100];
        case 'info': return colors.blue[100];
        default: return colors.gray[100];
      }
    }
  };
  
  // Get the text color based on the type and theme
  const getTextColor = () => {
    if (isDark) {
      switch (type) {
        case 'success': return colors.green[200];
        case 'error': return colors.red[200];
        case 'warning': return colors.amber[200];
        case 'info': return colors.blue[200];
        default: return colors.gray[200];
      }
    } else {
      switch (type) {
        case 'success': return colors.green[800];
        case 'error': return colors.red[800];
        case 'warning': return colors.amber[800];
        case 'info': return colors.blue[800];
        default: return colors.gray[800];
      }
    }
  };

  const handleClose = () => {
    // Fade out animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>

        {action && (
          <TouchableOpacity 
            onPress={action.onPress}
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: getTextColor() }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <X size={18} color={getTextColor()} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70, // Above bottom tab navigation
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

// Export utility functions to easily show common toast types
export const toast = {
  show: (message: string, options?: ToastOptions) => {
    return useToast().show(message, options);
  },
  success: (message: string, options?: ToastOptions) => {
    return useToast().show(message, { ...options, type: 'success' });
  },
  error: (message: string, options?: ToastOptions) => {
    return useToast().show(message, { ...options, type: 'error' });
  },
  info: (message: string, options?: ToastOptions) => {
    return useToast().show(message, { ...options, type: 'info' });
  },
  warning: (message: string, options?: ToastOptions) => {
    return useToast().show(message, { ...options, type: 'warning' });
  },
  hide: (id: string) => {
    useToast().hide(id);
  },
  hideAll: () => {
    useToast().hideAll();
  },
};