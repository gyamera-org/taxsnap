import { View, Pressable, TouchableOpacity } from 'react-native';
import { Text } from './text';
import { BeautyFact, getDailyBeautyFact, getRandomBeautyFact } from '@/lib/data/beauty-facts';
import { RefreshCw, Scan } from 'lucide-react-native';
import { useState } from 'react';
import Animated, {
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

interface BeautyFactCardProps {
  fact: BeautyFact;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
  compact?: boolean;
}

interface BeautyFactWrapperProps {
  compact?: boolean;
  className?: string;
}

const getCategoryColors = (themed: (light: string, dark: string) => string) => ({
  ingredient: { bg: themed('bg-green-50', 'bg-green-900/20'), border: themed('border-green-200', 'border-green-700'), text: themed('text-green-700', 'text-green-400') },
  science: { bg: themed('bg-blue-50', 'bg-blue-900/20'), border: themed('border-blue-200', 'border-blue-700'), text: themed('text-blue-700', 'text-blue-400') },
  history: { bg: themed('bg-purple-50', 'bg-purple-900/20'), border: themed('border-purple-200', 'border-purple-700'), text: themed('text-purple-700', 'text-purple-400') },
  myth: { bg: themed('bg-orange-50', 'bg-orange-900/20'), border: themed('border-orange-200', 'border-orange-700'), text: themed('text-orange-700', 'text-orange-400') },
  safety: { bg: themed('bg-red-50', 'bg-red-900/20'), border: themed('border-red-200', 'border-red-700'), text: themed('text-red-700', 'text-red-400') },
});

const categoryLabels = {
  ingredient: 'Ingredient',
  science: 'Science',
  history: 'History',
  myth: 'Myth Buster',
  safety: 'Safety',
};

// Wrapper component that manages state
export function BeautyFactCard({ compact = false, className = '' }: BeautyFactWrapperProps) {
  const [currentFact, setCurrentFact] = useState<BeautyFact>(() => getDailyBeautyFact());

  const handleRefresh = () => {
    setCurrentFact(getRandomBeautyFact());
  };

  return (
    <View className={className}>
      <BeautyFactCardInner
        fact={currentFact}
        onRefresh={handleRefresh}
        showRefreshButton={true}
        compact={compact}
      />
    </View>
  );
}

// Internal component that renders the actual card
function BeautyFactCardInner({
  fact,
  onRefresh,
  showRefreshButton = false,
  compact = false,
}: BeautyFactCardProps) {
  const rotateValue = useSharedValue(0);
  const themed = useThemedStyles();
  const colors = useThemedColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const handleRefresh = () => {
    rotateValue.value = withSpring(360, { duration: 600 }, () => {
      rotateValue.value = 0;
    });
    onRefresh?.();
  };

  const categoryColors = getCategoryColors(themed)[fact.category];

  if (compact) {
    return (
      <View className={themed("bg-pink-500 rounded-2xl p-6", "bg-pink-600 rounded-2xl p-6")}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Scan size={20} color="white" />
              <Text className="text-white font-bold text-xl ml-2">Ingredient Spotlight</Text>
            </View>
            <Text className={themed("text-gray-100 text-base", "text-gray-200 text-base")}>{fact.fact}</Text>
          </View>
          <TouchableOpacity
            className={themed("bg-white rounded-full px-6 py-3 ml-2", "bg-gray-800 rounded-full px-6 py-3 ml-2")}
            onPress={handleRefresh}
          >
            <View className="flex-row items-center">
              <Text className={themed("text-black font-bold text-base mr-2", "text-white font-bold text-base mr-2")}>New Fact</Text>
              <Animated.View style={animatedStyle}>
                <RefreshCw size={16} color={colors.foreground} />
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      entering={SlideInUp.delay(300).duration(800)}
      className={`${categoryColors.bg} ${categoryColors.border} border rounded-2xl p-6 shadow-sm`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className={themed("bg-white rounded-full p-2 mr-3 shadow-sm", "bg-gray-800 rounded-full p-2 mr-3 shadow-sm")}>
            <Scan size={20} color="#8B5CF6" />
          </View>
          <Text className={themed("text-lg font-bold text-gray-800", "text-lg font-bold text-gray-200")}>Daily Beauty Fact</Text>
        </View>
        {showRefreshButton && (
          <Pressable onPress={handleRefresh} className={themed("bg-white rounded-full p-2 shadow-sm", "bg-gray-800 rounded-full p-2 shadow-sm")}>
            <Animated.View style={animatedStyle}>
              <RefreshCw size={18} color={colors.gray[400]} />
            </Animated.View>
          </Pressable>
        )}
      </View>

      {/* Category Badge */}
      <View className="flex-row items-center mb-4">
        <View className={`px-3 py-1 ${categoryColors.bg} ${categoryColors.border} border rounded-full`}>
          <Text className={`text-sm font-medium ${categoryColors.text}`}>
            {categoryLabels[fact.category]}
          </Text>
        </View>
      </View>

      {/* Fact Content */}
      <View className="flex-row items-start">
        <View className="mr-4 mt-1">
          <Text className="text-4xl">{fact.emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className={themed("text-gray-800 text-lg leading-relaxed", "text-gray-200 text-lg leading-relaxed")}>
            <Text className={themed("font-bold text-gray-900", "font-bold text-white")}>Did you know?</Text> {fact.fact}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className={themed("mt-4 pt-4 border-t border-gray-200", "mt-4 pt-4 border-t border-gray-700")}>
        <Text className={themed("text-xs text-gray-500 text-center", "text-xs text-gray-400 text-center")}>
          Learn something new about beauty every day with LunaSync ✨
        </Text>
      </View>
    </Animated.View>
  );
}
