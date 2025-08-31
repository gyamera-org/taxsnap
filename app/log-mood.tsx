import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useAppNavigation } from '@/lib/hooks/use-navigation';
import { useState, useEffect } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { Heart, Sparkles } from 'lucide-react-native';
import { useLogPeriodData, usePeriodLogs, useTodaysPeriodLog } from '@/lib/hooks/use-cycle-data';

export default function LogMoodScreen() {
  const { goBack } = useAppNavigation();
  const [selectedMood, setSelectedMood] = useState<
    'happy' | 'normal' | 'sad' | 'irritable' | 'anxious' | ''
  >('');
  const [selectedEnergy, setSelectedEnergy] = useState<'high' | 'medium' | 'low' | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const logPeriodData = useLogPeriodData();
  const { data: periodLogs = [] } = usePeriodLogs();
  const todaysLog = useTodaysPeriodLog();

  // Set initial state from existing data
  useEffect(() => {
    if (todaysLog) {
      if (todaysLog.mood) {
        setSelectedMood(todaysLog.mood);
      }

      // Extract energy level from notes if it exists
      if (todaysLog.notes) {
        const energyMatch = todaysLog.notes.match(/Energy: (high|medium|low)/);
        if (energyMatch) {
          setSelectedEnergy(energyMatch[1] as 'high' | 'medium' | 'low');
          // Remove energy note from notes and set the remaining text
          const notesWithoutEnergy = todaysLog.notes
            .replace(/Energy: (high|medium|low)\s*/, '')
            .trim();
          setNotes(notesWithoutEnergy);
        } else {
          setNotes(todaysLog.notes);
        }
      }
    }
  }, [todaysLog]);

  const moodOptions = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: '#EC4899' },
    { value: 'normal', label: 'Normal', emoji: '😐', color: '#8B5CF6' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: '#06B6D4' },
    { value: 'irritable', label: 'Irritable', emoji: '😤', color: '#F59E0B' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', color: '#EF4444' },
  ];

  const energyOptions = [
    { value: 'high', label: 'High Energy', color: '#10B981', icon: '⚡' },
    { value: 'medium', label: 'Medium Energy', color: '#F59E0B', icon: '🔥' },
    { value: 'low', label: 'Low Energy', color: '#EF4444', icon: '🌙' },
  ];

  const handleSave = () => {
    if (!selectedMood || !selectedEnergy) return;

    setIsLoading(true);

    // Use local date format to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Store energy level in notes with a special format
    const moodNotes = notes.trim();
    const energyNote = `Energy: ${selectedEnergy}`;
    const combinedNotes = moodNotes ? `${energyNote} | ${moodNotes}` : energyNote;

    // Log mood (backend will handle merging with existing data)
    logPeriodData.mutate(
      {
        date: dateString,
        mood: selectedMood as any,
        notes: combinedNotes,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          goBack();
        },
        onError: (error) => {
          console.error('Error saving mood log:', error);
          setIsLoading(false);
        },
      }
    );
  };

  const isFormValid = selectedMood && selectedEnergy;

  return (
    <SubPageLayout
      title="Log Mood"
      rightElement={
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
          className={`px-6 py-3 rounded-full ${
            isFormValid && !isLoading ? 'bg-pink-500' : 'bg-gray-300'
          }`}
        >
          <Text
            className={`font-semibold ${
              isFormValid && !isLoading ? 'text-white' : 'text-gray-500'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6">
          {/* Header */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Sparkles size={28} color="#EC4899" />
              <Text className="text-2xl font-bold text-black ml-3">How are you feeling?</Text>
            </View>
            <Text className="text-gray-600 text-base">Track your mood and energy levels</Text>
          </View>

          {/* Mood Selection */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-black mb-4">Mood</Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {moodOptions.map((option) => {
                const isSelected = selectedMood === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedMood(option.value as any)}
                    className="flex-1 min-w-[48%] p-5 rounded-2xl border border-gray-100"
                    style={{
                      backgroundColor: isSelected ? `${option.color}15` : '#FFFFFF',
                      borderColor: isSelected ? option.color : '#E5E7EB',
                      borderWidth: isSelected ? 1.5 : 1,
                    }}
                  >
                    <View className="items-center">
                      <Text className="text-4xl mb-3">{option.emoji}</Text>
                      <Text
                        className="text-sm font-medium"
                        style={{ color: isSelected ? option.color : '#374151' }}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Energy Level */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-black mb-4">Energy Level</Text>
            <View style={{ gap: 12 }}>
              {energyOptions.map((option) => {
                const isSelected = selectedEnergy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedEnergy(option.value as any)}
                    className="p-5 rounded-2xl border border-gray-100 flex-row items-center"
                    style={{
                      backgroundColor: isSelected ? `${option.color}15` : '#FFFFFF',
                      borderColor: isSelected ? option.color : '#E5E7EB',
                      borderWidth: isSelected ? 1.5 : 1,
                    }}
                  >
                    <Text className="text-2xl mr-4">{option.icon}</Text>
                    <Text
                      className="font-medium text-base flex-1"
                      style={{ color: isSelected ? option.color : '#374151' }}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: option.color }}
                      >
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-black mb-4">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How are you feeling today? Any thoughts or reflections..."
              multiline
              numberOfLines={4}
              className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-800"
              style={{ textAlignVertical: 'top', minHeight: 100 }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Summary Card */}
          {isFormValid && (
            <View
              className="rounded-2xl p-5 mb-8 border"
              style={{
                backgroundColor: '#FDF2F8',
                borderColor: '#F9A8D4',
                borderWidth: 1.5,
              }}
            >
              <View className="flex-row items-center mb-3">
                <Heart size={20} color="#EC4899" />
                <Text className="font-semibold text-pink-800 ml-3 text-base">Today's Summary</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">
                  {moodOptions.find((m) => m.value === selectedMood)?.emoji}
                </Text>
                <Text className="text-pink-700 text-sm flex-1">
                  Feeling <Text className="font-semibold">{selectedMood}</Text> with{' '}
                  <Text className="font-semibold">{selectedEnergy}</Text> energy
                </Text>
                <Text className="text-xl">
                  {energyOptions.find((e) => e.value === selectedEnergy)?.icon}
                </Text>
              </View>
              {notes.trim() && (
                <View className="mt-3 pt-3 border-t border-pink-200">
                  <Text className="text-pink-600 text-sm italic">"{notes.trim()}"</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}
