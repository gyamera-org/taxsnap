import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Info, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

export function MedicalCitations() {
  const router = useRouter();
  const themed = useThemedStyles();
  const colors = useThemedColors();

  return (
    <TouchableOpacity
      className={themed("bg-gray-50 rounded-xl p-4 mb-4", "bg-gray-800 rounded-xl p-4 mb-4")}
      onPress={() => router.push('/settings/medical-sources')}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Info size={16} color={colors.gray[500]} />
          <Text className={themed("text-sm text-gray-700 ml-2 font-medium", "text-sm text-gray-300 ml-2 font-medium")}>
            Recommendations based on scientific evidence
          </Text>
        </View>
        <ChevronRight size={16} color={colors.gray[500]} />
      </View>
      
      <Text className={themed("text-xs text-gray-500 mt-2", "text-xs text-gray-400 mt-2")}>
        Tap to learn how Luna makes recommendations
      </Text>
    </TouchableOpacity>
  );
}