import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

type SubPageLayoutProps = {
  children: React.ReactNode;
  title: string;
  rightElement?: React.ReactNode;
};

export function SubPageLayout({ children, title, rightElement }: SubPageLayoutProps) {
  return (
    <View className="flex-1 bg-white pt-14">
      <View className="flex-row items-center px-4 h-14">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center flex-row justify-center bg-slate-100 rounded-full"
        >
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-xl font-semibold ml-2">{title}</Text>
        </View>
        {rightElement && <View className="ml-auto">{rightElement}</View>}
      </View>

      <View className="flex-1 mt-4">{children}</View>
    </View>
  );
}
