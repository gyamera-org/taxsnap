import { View, Modal, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';

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
  confirmText = 'Delete',
  cancelText = 'Cancel',
  destructive = false,
}: Props) {
  const themed = useThemedStyles();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className={themed("bg-white w-full rounded-xl p-6", "bg-gray-800 w-full rounded-xl p-6")}>
          <Text className={themed("text-2xl font-semibold text-center mb-2", "text-2xl font-semibold text-center mb-2 text-white")}>{title}</Text>
          <Text className={themed("text-gray-600 text-center mb-8", "text-gray-300 text-center mb-8")}>{message}</Text>

          <View className="flex-row gap-4">
            <Pressable
              onPress={onConfirm}
              className={themed(`flex-1 py-3 rounded-xl ${destructive ? 'bg-red-600' : 'bg-blue-500'}`, `flex-1 py-3 rounded-xl ${destructive ? 'bg-red-700' : 'bg-blue-600'}`)}
            >
              <Text className="text-white text-center font-medium">{confirmText}</Text>
            </Pressable>

            <Pressable onPress={onClose} className={themed("flex-1 py-3 rounded-xl bg-gray-100", "flex-1 py-3 rounded-xl bg-gray-700")}>
              <Text className={themed("text-center font-medium", "text-center font-medium text-white")}>{cancelText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
