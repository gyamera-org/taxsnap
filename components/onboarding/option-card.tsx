import { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  animationDelay?: number;
  accentColor?: 'emerald' | 'blue';
}

export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  animationDelay = 300,
  accentColor = 'emerald',
}: OptionCardProps) {
  const borderColor = selected
    ? accentColor === 'emerald'
      ? 'border-emerald-500'
      : 'border-blue-500'
    : 'border-white/10';

  const bgColor = selected
    ? accentColor === 'emerald'
      ? 'bg-emerald-500/10'
      : 'bg-blue-500/10'
    : 'bg-white/5';

  const iconBgColor = selected
    ? accentColor === 'emerald'
      ? 'bg-emerald-500/20'
      : 'bg-blue-500/20'
    : 'bg-white/10';

  return (
    <Pressable onPress={onSelect}>
      <View className={`rounded-2xl p-5 border-2 ${borderColor} ${bgColor}`}>
        <View className="flex-row items-center">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${iconBgColor}`}>
            {icon}
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{title}</Text>
            <Text className="text-gray-500 text-sm">{subtitle}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface StrategyCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  metricLabel: string;
  metricValue: string;
  badge?: string;
  accentColor?: 'emerald' | 'blue';
}

export function StrategyCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  metricLabel,
  metricValue,
  badge,
  accentColor = 'emerald',
}: StrategyCardProps) {
  const borderColor = selected
    ? accentColor === 'emerald'
      ? 'border-emerald-500'
      : 'border-blue-500'
    : 'border-white/10';

  const bgColor = selected
    ? accentColor === 'emerald'
      ? 'bg-emerald-500/10'
      : 'bg-blue-500/10'
    : 'bg-white/5';

  const iconBgColor = selected
    ? accentColor === 'emerald'
      ? 'bg-emerald-500/20'
      : 'bg-blue-500/20'
    : 'bg-white/10';

  const metricColor =
    accentColor === 'emerald' ? 'text-emerald-400' : 'text-blue-400';

  return (
    <Pressable onPress={onSelect}>
      <View className={`rounded-2xl p-4 border-2 ${borderColor} ${bgColor}`}>
        <View className="flex-row items-center mb-2">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${iconBgColor}`}>
            {icon}
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold">{title}</Text>
            <Text className="text-gray-500 text-xs">{subtitle}</Text>
          </View>
          {badge && selected && (
            <View className="bg-emerald-500 px-2 py-1 rounded">
              <Text className="text-white text-xs font-semibold">{badge}</Text>
            </View>
          )}
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-400 text-sm">{metricLabel}</Text>
          <Text className={`font-bold text-sm ${metricColor}`}>{metricValue}</Text>
        </View>
      </View>
    </Pressable>
  );
}
