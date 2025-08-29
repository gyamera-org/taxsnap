import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check, Globe } from 'lucide-react-native';

interface CommunityShareToggleProps {
  shareWithCommunity: boolean;
  onToggle: () => void;
}

export const CommunityShareToggle: React.FC<CommunityShareToggleProps> = ({
  shareWithCommunity,
  onToggle,
}) => {
  return (
    <View className="mx-4 mb-6">
      <TouchableOpacity
        onPress={onToggle}
        className={`rounded-2xl p-4 border ${
          shareWithCommunity ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
        }`}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <View
            className={`w-6 h-6 rounded-full border mr-4 items-center justify-center ${
              shareWithCommunity ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
            }`}
          >
            {shareWithCommunity && <Check size={14} color="white" />}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Globe size={24} color="#10B981" />
              <Text
                className={`text-base font-semibold ml-2 ${
                  shareWithCommunity ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                Share with Community
              </Text>
            </View>
            <Text className={`text-sm ${shareWithCommunity ? 'text-blue-700' : 'text-gray-600'}`}>
              Help others by contributing your custom foods to our community database
            </Text>
          </View>
          {shareWithCommunity && (
            <View className="bg-blue-100 px-3 py-1 rounded-full ml-2">
              <Text className="text-blue-800 text-xs font-medium">Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
