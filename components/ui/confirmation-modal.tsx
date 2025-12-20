import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedColors } from '@/lib/utils/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}: Props) {
  const colors = useThemedColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.modalBackground,
              shadowColor: colors.shadowColor,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

            <View style={styles.buttons}>
              <Pressable
                onPress={onConfirm}
                style={[
                  styles.button,
                  {
                    backgroundColor: destructive ? colors.danger : colors.primary,
                  },
                ]}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={[styles.button, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
