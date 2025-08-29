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

const categoryColors = {
  ingredient: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  science: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  history: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  myth: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  safety: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const handleRefresh = () => {
    rotateValue.value = withSpring(360, { duration: 600 }, () => {
      rotateValue.value = 0;
    });
    onRefresh?.();
  };

  const colors = categoryColors[fact.category];

  if (compact) {
    return (
      <View className="bg-pink-500 rounded-2xl p-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Scan size={20} color="white" />
              <Text className="text-white font-bold text-xl ml-2">Ingredient Spotlight</Text>
            </View>
            <Text className="text-gray-100 text-base">{fact.fact}</Text>
          </View>
          <TouchableOpacity
            className="bg-white rounded-full px-6 py-3 ml-2"
            onPress={handleRefresh}
          >
            <View className="flex-row items-center">
              <Text className="text-black font-bold text-base mr-2">New Fact</Text>
              <Animated.View style={animatedStyle}>
                <RefreshCw size={16} color="black" />
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
      className={`${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-sm`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-white rounded-full p-2 mr-3 shadow-sm">
            <Scan size={20} color="#8B5CF6" />
          </View>
          <Text className="text-lg font-bold text-gray-800">Daily Beauty Fact</Text>
        </View>
        {showRefreshButton && (
          <Pressable onPress={handleRefresh} className="bg-white rounded-full p-2 shadow-sm">
            <Animated.View style={animatedStyle}>
              <RefreshCw size={18} color="#666" />
            </Animated.View>
          </Pressable>
        )}
      </View>

      {/* Category Badge */}
      <View className="flex-row items-center mb-4">
        <View className={`px-3 py-1 ${colors.bg} ${colors.border} border rounded-full`}>
          <Text className={`text-sm font-medium ${colors.text}`}>
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
          <Text className="text-gray-800 text-lg leading-relaxed">
            <Text className="font-bold text-gray-900">Did you know?</Text> {fact.fact}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-4 pt-4 border-t border-gray-200">
        <Text className="text-xs text-gray-500 text-center">
          Learn something new about beauty every day with BeautyScan ✨
        </Text>
      </View>
    </Animated.View>
  );
}
