import { View } from 'react-native';
import { Text } from '@/components/ui/text';

// This screen should never be shown since the tab button opens a modal instead
export default function LoggerScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Logger Modal</Text>
    </View>
  );
}
