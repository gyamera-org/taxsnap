import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { Check } from 'lucide-react-native';
import { usePeriodLogs, useTodaysPeriodLog } from '@/lib/hooks/use-cycle-data';
import { useLogSymptoms } from '@/lib/hooks/use-symptoms-mood';
import { Button } from '@/components/ui/button';
import { getLocalDateString } from '@/lib/utils/date-helpers';
import {
  CrampsIcon,
  HeadacheIcon,
  MoodSwingsIcon,
  BloatingIcon,
  FatigueIcon,
  BreastTendernessIcon,
  BackPainIcon,
  NauseaIcon,
  AcneIcon,
  FoodCravingsIcon,
  InsomniaIcon,
  AnxietyIcon,
} from '@/components/icons/symptom-icons';

export default function LogSymptomsScreen() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const logSymptoms = useLogSymptoms();
  const { data: periodLogs = [] } = usePeriodLogs();
  const todaysLog = useTodaysPeriodLog();

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    { value: 'cramps', label: 'Cramps', icon: 'cramps' },
    { value: 'headache', label: 'Headache', icon: 'headache' },
    { value: 'mood_swings', label: 'Mood Swings', icon: 'mood_swings' },
    { value: 'fatigue', label: 'Fatigue', icon: 'fatigue' },
    { value: 'nausea', label: 'Nausea', icon: 'nausea' },
    { value: 'insomnia', label: 'Insomnia', icon: 'insomnia' },
    { value: 'anxiety', label: 'Anxiety', icon: 'anxiety' },
    { value: 'food_cravings', label: 'Food Cravings', icon: 'food_cravings' },
    { value: 'acne', label: 'Acne', icon: 'acne' },
    { value: 'breast_tenderness', label: 'Breast Tenderness', icon: 'breast_tenderness' },
    { value: 'bloating', label: 'Bloating', icon: 'bloating' },
    { value: 'back_pain', label: 'Back Pain', icon: 'back_pain' },
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
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
    const dateString = getLocalDateString();

    // Log symptoms using direct Supabase function
    logSymptoms.mutate(
      {
        date: dateString,
        symptoms: selectedSymptoms,
        severity: selectedSeverity || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          // Navigate back to cycle tab specifically
          router.push('/(tabs)/cycle');
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
    <View className="flex-1" style={{ backgroundColor: '#F5F1E8' }}>
      <SubPageLayout
        title="Log Symptoms"
        onBack={() => router.back()}
        rightElement={
          <Button
            title="Log"
            onPress={handleSave}
            variant="primary"
            size="small"
            disabled={!isFormValid || isLoading}
            loading={isLoading}
          />
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              className="px-4 pt-6"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* Header */}
              <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-4">Track Your Symptoms</Text>
                <Text className="text-gray-600 text-base">
                  Select any symptoms you're experiencing today.
                </Text>
              </View>

              {/* Symptom Selection */}
              <View className="mb-8">
                <View style={{ gap: 16 }}>
                  {symptomOptions.map((option) => {
                    const isSelected = selectedSymptoms.includes(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSymptomToggle(option.value)}
                        className="flex-row items-center p-6 rounded-2xl"
                        style={{
                          backgroundColor: isSelected
                            ? 'rgba(255, 182, 193, 0.3)'
                            : 'rgba(255, 255, 255, 0.8)',
                          borderWidth: 0,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        <View className="mr-6">
                          {option.icon === 'cramps' && <CrampsIcon size={60} />}
                          {option.icon === 'headache' && <HeadacheIcon size={60} />}
                          {option.icon === 'mood_swings' && <MoodSwingsIcon size={60} />}
                          {option.icon === 'bloating' && <BloatingIcon size={60} />}
                          {option.icon === 'fatigue' && <FatigueIcon size={60} />}
                          {option.icon === 'breast_tenderness' && (
                            <BreastTendernessIcon size={60} />
                          )}
                          {option.icon === 'back_pain' && <BackPainIcon size={60} />}
                          {option.icon === 'nausea' && <NauseaIcon size={60} />}
                          {option.icon === 'acne' && <AcneIcon size={60} />}
                          {option.icon === 'food_cravings' && <FoodCravingsIcon size={60} />}
                          {option.icon === 'insomnia' && <InsomniaIcon size={60} />}
                          {option.icon === 'anxiety' && <AnxietyIcon size={60} />}
                        </View>
                        <View className="flex-1">
                          <Text className="text-xl font-medium text-gray-800">{option.label}</Text>
                        </View>
                        {isSelected && (
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center"
                            style={{ backgroundColor: '#EC4899' }}
                          >
                            <Check size={16} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Severity Level */}
              {/* {selectedSymptoms.length > 0 && (
                <View className="mb-8">
                  <Text className="text-xl font-semibold text-gray-900 mb-4">Severity Level</Text>
                  <View style={{ gap: 16 }}>
                    {severityOptions.map((option) => {
                      const isSelected = selectedSeverity === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => setSelectedSeverity(option.value as any)}
                          className="flex-row items-center p-4 rounded-2xl"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255, 182, 193, 0.3)'
                              : 'rgba(255, 255, 255, 0.8)',
                            borderWidth: 0,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                          }}
                        >
                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900">
                              {option.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: '#EC4899' }}
                            >
                              <Check size={16} color="white" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )} */}

              {/* Notes Section */}
              {/* <View className="mb-8">
                <Text className="text-lg font-semibold text-black mb-4">Notes</Text>
                <View
                  className="bg-white rounded-2xl border border-gray-200 p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any additional details..."
                    multiline
                    numberOfLines={3}
                    className="text-gray-800 text-base leading-relaxed"
                    style={{ textAlignVertical: 'top', minHeight: 80 }}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View> */}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SubPageLayout>
    </View>
  );
}
