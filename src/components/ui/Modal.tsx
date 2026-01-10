/**
 * Modal Component
 * Reusable modal/bottom sheet component
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModalType = 'center' | 'bottom' | 'fullscreen';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  type?: ModalType;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
  maxHeight?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  type = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  children,
  footer,
  contentStyle,
  maxHeight,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const getContainerStyle = (): ViewStyle => {
    switch (type) {
      case 'bottom':
        return {
          justifyContent: 'flex-end',
        };
      case 'fullscreen':
        return {
          justifyContent: 'flex-start',
        };
      default:
        return {
          justifyContent: 'center',
          paddingHorizontal: theme.spacing[4],
        };
    }
  };

  const getContentStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.card,
      overflow: 'hidden',
    };

    switch (type) {
      case 'bottom':
        return {
          ...baseStyle,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
          maxHeight: maxHeight || SCREEN_HEIGHT * 0.9,
          paddingBottom: insets.bottom || theme.spacing[4],
        };
      case 'fullscreen':
        return {
          ...baseStyle,
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        };
      default:
        return {
          ...baseStyle,
          borderRadius: theme.borderRadius.xl,
          maxHeight: maxHeight || SCREEN_HEIGHT * 0.8,
          width: '100%',
          maxWidth: 400,
        };
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={type === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <Pressable
          style={[styles.overlay, getContainerStyle()]}
          onPress={closeOnBackdrop ? onClose : undefined}
        >
          <Pressable style={[getContentStyle(), contentStyle]} onPress={() => {}}>
            {/* Handle indicator for bottom sheet */}
            {type === 'bottom' && (
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: theme.colors.gray[300] },
                  ]}
                />
              </View>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <View
                style={[
                  styles.header,
                  {
                    borderBottomWidth: title ? 1 : 0,
                    borderBottomColor: theme.colors.border,
                    paddingHorizontal: theme.spacing[4],
                    paddingTop: type === 'bottom' ? theme.spacing[2] : theme.spacing[4],
                    paddingBottom: title ? theme.spacing[3] : 0,
                  },
                ]}
              >
                <View style={styles.titleContainer}>
                  {title && (
                    <Text
                      style={[
                        styles.title,
                        {
                          color: theme.colors.text.primary,
                          fontSize: theme.typography.fontSize.lg,
                        },
                      ]}
                    >
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.fontSize.sm,
                          marginTop: theme.spacing[1],
                        },
                      ]}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={[
                      styles.closeButton,
                      { backgroundColor: theme.colors.gray[100] },
                    ]}
                    accessibilityLabel="Close modal"
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={{
                padding: theme.spacing[4],
              }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && (
              <View
                style={[
                  styles.footer,
                  {
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    padding: theme.spacing[4],
                  },
                ]}
              >
                {footer}
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

/**
 * Confirmation Modal
 */
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      closeOnBackdrop={!loading}
    >
      <View style={styles.confirmContent}>
        <Text
          style={[
            styles.confirmTitle,
            { color: theme.colors.text.primary, fontSize: 18 },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.confirmMessage,
            {
              color: theme.colors.text.secondary,
              fontSize: 14,
              marginTop: theme.spacing[2],
            },
          ]}
        >
          {message}
        </Text>
        <View style={[styles.confirmButtons, { marginTop: theme.spacing[4] }]}>
          <TouchableOpacity
            onPress={onClose}
            disabled={loading}
            style={[
              styles.confirmButton,
              {
                backgroundColor: theme.colors.gray[100],
                marginRight: theme.spacing[2],
              },
            ]}
          >
            <Text
              style={[styles.buttonText, { color: theme.colors.text.primary }]}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading}
            style={[
              styles.confirmButton,
              {
                backgroundColor:
                  confirmVariant === 'danger'
                    ? theme.colors.error[500]
                    : theme.colors.primary[500],
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {loading ? 'Loading...' : confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {},
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 0,
  },
  footer: {},
  confirmContent: {
    alignItems: 'center',
  },
  confirmTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmMessage: {
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Modal;
