import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { AlertCircle, Sparkles } from 'lucide-react-native';
import { useLogPeriodData, usePeriodLogs, useTodaysPeriodLog } from '@/lib/hooks/use-cycle-data';
import { useAppNavigation } from '@/lib/hooks/use-navigation';

export default function LogSymptomsScreen() {
  const { goBack } = useAppNavigation();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const logPeriodData = useLogPeriodData();
  const { data: periodLogs = [] } = usePeriodLogs();
  const todaysLog = useTodaysPeriodLog();

  // Set initial state from existing data
  useEffect(() => {
    if (todaysLog) {
      if (todaysLog.symptoms && todaysLog.symptoms.length > 0) {
        setSelectedSymptoms(todaysLog.symptoms);
      }

      // Extract severity from notes if it exists
      if (todaysLog.notes) {
        const severityMatch = todaysLog.notes.match(/Severity: (mild|moderate|severe)/);
        if (severityMatch) {
          setSelectedSeverity(severityMatch[1] as 'mild' | 'moderate' | 'severe');
          // Remove severity note from notes and set the remaining text
          const notesWithoutSeverity = todaysLog.notes
            .replace(/Severity: (mild|moderate|severe)\s*/, '')
            .trim();
          setNotes(notesWithoutSeverity);
        } else {
          setNotes(todaysLog.notes);
        }
      }
    }
  }, [todaysLog]);

  const symptomOptions = [
    { value: 'cramps', label: 'Cramps', emoji: '🤕', color: '#EF4444' },
    { value: 'headache', label: 'Headache', emoji: '🤯', color: '#F59E0B' },
    { value: 'mood_swings', label: 'Mood Swings', emoji: '😤', color: '#8B5CF6' },
    { value: 'bloating', label: 'Bloating', emoji: '🫃', color: '#06B6D4' },
    { value: 'fatigue', label: 'Fatigue', emoji: '😴', color: '#6B7280' },
    { value: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💔', color: '#EC4899' },
    { value: 'back_pain', label: 'Back Pain', emoji: '🔥', color: '#DC2626' },
    { value: 'nausea', label: 'Nausea', emoji: '🤢', color: '#10B981' },
    { value: 'acne', label: 'Acne', emoji: '🔴', color: '#F97316' },
    { value: 'food_cravings', label: 'Food Cravings', emoji: '🍫', color: '#84CC16' },
    { value: 'insomnia', label: 'Insomnia', emoji: '🌙', color: '#3B82F6' },
    { value: 'anxiety', label: 'Anxiety', emoji: '😰', color: '#F59E0B' },
  ];

  const severityOptions = [
    {
      value: 'mild',
      label: 'Mild',
      color: '#10B981',
      icon: '🟢',
      description: 'Barely noticeable',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      color: '#F59E0B',
      icon: '🟡',
      description: 'Somewhat bothersome',
    },
    {
      value: 'severe',
      label: 'Severe',
      color: '#EF4444',
      icon: '🔴',
      description: 'Very uncomfortable',
    },
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSave = () => {
    if (selectedSymptoms.length === 0) return;

    setIsLoading(true);

    // Use local date format to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Store severity in notes with a special format
    const symptomNotes = notes.trim();
    const severityNote = selectedSeverity ? `Severity: ${selectedSeverity}` : '';
    const combinedNotes =
      symptomNotes && severityNote
        ? `${severityNote} | ${symptomNotes}`
        : severityNote || symptomNotes;

    // Log symptoms (backend will handle merging with existing data)
    logPeriodData.mutate(
      {
        date: dateString,
        symptoms: selectedSymptoms,
        notes: combinedNotes || undefined,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          goBack();
        },
        onError: (error) => {
          console.error('Error saving symptom log:', error);
          setIsLoading(false);
        },
      }
    );
  };

  const isFormValid = selectedSymptoms.length > 0;

  return (
    <SubPageLayout
      title="Log Symptoms"
      rightElement={
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
          className={`px-6 py-3 rounded-full ${
            isFormValid && !isLoading ? 'bg-orange-500' : 'bg-gray-300'
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
              <Sparkles size={28} color="#F97316" />
              <Text className="text-2xl font-bold text-black ml-3">Track your symptoms</Text>
            </View>
            <Text className="text-gray-600 text-base">Log any symptoms you're experiencing</Text>
          </View>

          {/* Symptom Selection */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-black mb-4">
              Symptoms ({selectedSymptoms.length} selected)
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {symptomOptions.map((option) => {
                const isSelected = selectedSymptoms.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSymptomToggle(option.value)}
                    className="flex-1 min-w-[48%] p-4 rounded-2xl border border-gray-100"
                    style={{
                      backgroundColor: isSelected ? `${option.color}15` : '#FFFFFF',
                      borderColor: isSelected ? option.color : '#E5E7EB',
                      borderWidth: isSelected ? 1.5 : 1,
                    }}
                  >
                    <View className="items-center">
                      <Text className="text-3xl mb-2">{option.emoji}</Text>
                      <Text
                        className="text-xs font-medium text-center"
                        style={{ color: isSelected ? option.color : '#374151' }}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <View
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: option.color }}
                        >
                          <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Severity Level */}
          {selectedSymptoms.length > 0 && (
            <View className="mb-8">
              <Text className="text-lg font-semibold text-black mb-4">Overall Severity</Text>
              <View style={{ gap: 12 }}>
                {severityOptions.map((option) => {
                  const isSelected = selectedSeverity === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedSeverity(option.value as any)}
                      className="p-5 rounded-2xl border border-gray-100 flex-row items-center"
                      style={{
                        backgroundColor: isSelected ? `${option.color}15` : '#FFFFFF',
                        borderColor: isSelected ? option.color : '#E5E7EB',
                        borderWidth: isSelected ? 1.5 : 1,
                      }}
                    >
                      <Text className="text-2xl mr-4">{option.icon}</Text>
                      <View className="flex-1">
                        <Text
                          className="font-medium text-base"
                          style={{ color: isSelected ? option.color : '#374151' }}
                        >
                          {option.label}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">{option.description}</Text>
                      </View>
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
          )}

          {/* Notes Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-black mb-4">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details about your symptoms..."
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
                backgroundColor: '#FFF7ED',
                borderColor: '#FB923C',
                borderWidth: 1.5,
              }}
            >
              <View className="flex-row items-center mb-3">
                <AlertCircle size={20} color="#F97316" />
                <Text className="font-semibold text-orange-800 ml-3 text-base">
                  Today's Symptoms
                </Text>
              </View>

              <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
                {selectedSymptoms.map((symptomValue) => {
                  const symptom = symptomOptions.find((s) => s.value === symptomValue);
                  return (
                    <View
                      key={symptomValue}
                      className="flex-row items-center px-3 py-1 rounded-lg"
                      style={{ backgroundColor: `${symptom?.color}20` }}
                    >
                      <Text className="mr-1">{symptom?.emoji}</Text>
                      <Text className="text-xs font-medium" style={{ color: symptom?.color }}>
                        {symptom?.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {selectedSeverity && (
                <View className="flex-row items-center mb-3">
                  <Text className="text-sm text-orange-700">
                    Severity: <Text className="font-semibold">{selectedSeverity}</Text>
                  </Text>
                </View>
              )}

              {notes.trim() && (
                <View className="mt-3 pt-3 border-t border-orange-200">
                  <Text className="text-orange-600 text-sm italic">"{notes.trim()}"</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}
