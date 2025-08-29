import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';

export default function LogMoodScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moods = [
    { id: 'amazing', emoji: '🤩', label: 'Amazing', color: '#EC4899' },
    { id: 'great', emoji: '😊', label: 'Great', color: '#EC4899' },
    { id: 'good', emoji: '🙂', label: 'Good', color: '#EC4899' },
    { id: 'okay', emoji: '😐', label: 'Okay', color: '#6B7280' },
    { id: 'bad', emoji: '😔', label: 'Bad', color: '#6B7280' },
    { id: 'terrible', emoji: '😢', label: 'Terrible', color: '#6B7280' },
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleSave = () => {
    if (selectedMood) {
      const mood = moods.find((m) => m.id === selectedMood);
      router.back();
    }
  };

  return (
    <SubPageLayout
      title="Mood"
      rightElement={
        <Button
          title="Save"
          onPress={handleSave}
          variant="primary"
          size="small"
          disabled={!selectedMood}
        />
      }
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6">
          <Text className="text-lg font-semibold text-black mb-6 text-center">
            How are you feeling today?
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                onPress={() => handleMoodSelect(mood.id)}
                className="w-[30%] mb-6"
              >
                <View
                  className="bg-white rounded-2xl p-4 items-center shadow-sm border"
                  style={{
                    backgroundColor: selectedMood === mood.id ? `${mood.color}10` : 'white',
                    borderColor: selectedMood === mood.id ? mood.color : '#E5E7EB',
                  }}
                >
                  <Text className="text-4xl mb-2">{mood.emoji}</Text>
                  <Text
                    className="text-sm font-medium text-center"
                    style={{ color: selectedMood === mood.id ? mood.color : '#374151' }}
                  >
                    {mood.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}
