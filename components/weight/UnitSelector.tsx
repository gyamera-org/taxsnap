import { View, Text, Pressable } from 'react-native';
import { Settings, Edit3 } from 'lucide-react-native';
import { type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { useTheme } from '@/context/theme-provider';

interface UnitSelectorProps {
  bodyMeasurements: BodyMeasurements | null;
  onShowUnitPicker: () => void;
}

export function UnitSelector({ bodyMeasurements, onShowUnitPicker }: UnitSelectorProps) {
  const { isDark } = useTheme();

  return (
    <View className={`rounded-2xl p-4 mb-3 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="flex-row items-center mb-3">
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <Settings size={20} color={isDark ? '#d1d5db' : '#374151'} />
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Weight Units</Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose your preferred unit</Text>
        </View>
        <Pressable onPress={onShowUnitPicker} className="p-1">
          <Edit3 size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
        </Pressable>
      </View>

      <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {bodyMeasurements?.units === 'metric' ? 'Metric' : bodyMeasurements?.units === 'imperial' ? 'Imperial' : bodyMeasurements?.units === 'kg' ? 'Metric' : bodyMeasurements?.units === 'lbs' ? 'Imperial' : 'Metric'}
      </Text>
    </View>
  );
}
