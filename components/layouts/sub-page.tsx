import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { useAppNavigation } from '@/lib/hooks/use-navigation';
import { useTheme } from '@/context/theme-provider';

type SubPageLayoutProps = {
  children: React.ReactNode;
  title?: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
};

const SubPageLayout = ({ children, title = 'Page', rightElement, onBack }: SubPageLayoutProps) => {
  const { goBack } = useAppNavigation();
  const { isDark } = useTheme();

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  // Ensure title is a string
  const safeTitle = typeof title === 'string' ? title : 'Page';

  return (
    <View className={`flex-1 pt-14 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-row items-center px-4 h-14">
        <Pressable
          onPress={handleGoBack}
          className={`w-10 h-10 items-center flex-row justify-center rounded-full ${isDark ? 'bg-gray-700' : 'bg-slate-100'}`}
        >
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#000000'} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className={`text-xl font-semibold ml-2 ${isDark ? 'text-white' : 'text-black'}`}>{safeTitle}</Text>
        </View>
        {rightElement && <View className="ml-auto">{rightElement}</View>}
      </View>

      <View className="flex-1 mt-4">{children}</View>
    </View>
  );
};

export default SubPageLayout;
