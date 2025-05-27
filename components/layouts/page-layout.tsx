import { View, Image } from 'react-native';
import { Text } from '@/components/ui/text';

interface Props {
  children: React.ReactNode;
  title: string;
  image?: string;
  btn?: React.ReactNode;
}

const PageLayout = ({ children, title, image, btn }: Props) => {
  return (
    <View className="flex-1 bg-slate-100 pt-5">
      <View className="flex-row items-center justify-between pb-4 pt-12 px-4">
        <Text className="text-4xl font-bold">{title}</Text>
        {image && (
          <Image
            source={require('@/assets/images/avatar.png')}
            className="w-14 h-14 rounded-full mr-4"
          />
        )}
        {btn}
      </View>
      {children}
    </View>
  );
};

export default PageLayout;
