import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/context/theme-provider';

const SettingsSubpage = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { isDark } = useTheme();

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-row items-center px-4 pt-16 pb-6">
        <Pressable
          onPress={() => router.back()}
          className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-slate-100'}`}
        >
          <ArrowLeft size={24} color={isDark ? '#ffffff' : '#000000'} />
        </Pressable>
        <Text className={`text-2xl font-semibold ml-4 ${isDark ? 'text-white' : 'text-black'}`}>{title}</Text>
      </View>
      {children}
    </ScrollView>
  );
};

export default SettingsSubpage;
