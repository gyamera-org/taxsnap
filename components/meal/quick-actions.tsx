import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Camera, Search, Plus, Sparkles } from 'lucide-react-native';

interface QuickActionsProps {
  selectedMealType: string;
  onScanFood: () => void;
  onSearch: () => void;
  onAddCustomFood: () => void;
  onAIScan: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  selectedMealType,
  onScanFood,
  onSearch,
  onAddCustomFood,
  onAIScan,
}) => {
  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">Add Food</Text>
      <View className="flex-row gap-3 mb-3">
        <TouchableOpacity
          onPress={onScanFood}
          className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
        >
          <Camera size={24} color="#10B981" />
          <Text className="text-gray-900 font-semibold mt-2">Scan Food</Text>
          <Text className="text-gray-500 text-xs">AI nutrition analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSearch}
          className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
        >
          <Search size={24} color="#10B981" />
          <Text className="text-gray-900 font-semibold mt-2">Search</Text>
          <Text className="text-gray-500 text-xs">Find in database</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onAddCustomFood}
        className="bg-white border border-gray-200 rounded-2xl p-4 items-center"
      >
        <Plus size={24} color="#3B82F6" />
        <Text className="text-gray-900 font-semibold mt-2">Add Custom Food</Text>
        <Text className="text-gray-500 text-xs">Create your own entry</Text>
      </TouchableOpacity>

      {/* Quick Scan Button */}
      <TouchableOpacity
        onPress={onAIScan}
        className="mt-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 flex-row items-center justify-center"
      >
        <Sparkles size={20} color="white" />
        <Text className="text-white font-semibold ml-2">Or try AI Food Scanner</Text>
      </TouchableOpacity>
    </View>
  );
};
