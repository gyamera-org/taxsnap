import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';

type SubPageLayoutProps = {
  children: React.ReactNode;
  title?: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
};

const SubPageLayout = ({ children, title = 'Page', rightElement, onBack }: SubPageLayoutProps) => {
  const router = useRouter();
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Ensure title is a string
  const safeTitle = typeof title === 'string' ? title : 'Page';

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="flex-row items-center px-4 h-14">
        <Pressable
          onPress={handleGoBack}
          className="w-10 h-10 items-center flex-row justify-center bg-slate-100 rounded-full"
        >
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-xl font-semibold ml-2">{safeTitle}</Text>
        </View>
        {rightElement && <View className="ml-auto">{rightElement}</View>}
      </View>

      <View className="flex-1 mt-4">{children}</View>
    </View>
  );
};

export default SubPageLayout;
