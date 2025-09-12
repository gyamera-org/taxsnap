import { View, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 180 : 0);
  const themed = useThemedStyles();
  const colors = useThemedColors();

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 180, { duration: 300 });
  };

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View className={themed("border-b border-gray-100 last:border-b-0", "border-b border-gray-700 last:border-b-0")}>
      <Pressable onPress={toggleAccordion} className="flex-row justify-between items-center p-4">
        <Text className="text-base font-medium flex-1 mr-2">{title}</Text>
        <Animated.View style={iconStyle}>
          <ChevronDown size={20} color={colors.foreground} />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={Platform.OS === 'ios' ? undefined : undefined}
          className="px-4 pb-4"
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}
