import { View, Pressable, ScrollView } from 'react-native';
import { Text } from './text';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChangeTab: (tabId: string) => void;
};

export function Tabs({ tabs, activeTab, onChangeTab }: TabsProps) {
  const themed = useThemedStyles();
  const colors = useThemedColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={themed("border-b border-gray-200 px-4", "border-b border-gray-700 px-4")}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onChangeTab(tab.id)}
          className={`px-4 py-3 border-b-2 ${
            activeTab === tab.id ? themed('border-black', 'border-white') : 'border-transparent'
          }`}
        >
          <Text className={activeTab === tab.id ? themed('text-black', 'text-white') : themed('text-gray-500', 'text-gray-400')}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
