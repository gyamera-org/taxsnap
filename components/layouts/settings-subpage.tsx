import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

const SettingsSubpage = ({ children, title }: { children: React.ReactNode; title: string }) => {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-16 pb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
        >
          <ArrowLeft size={24} />
        </Pressable>
        <Text className="text-2xl font-semibold ml-4">{title}</Text>
      </View>
      {children}
    </ScrollView>
  );
};

export default SettingsSubpage;
