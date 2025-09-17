import { View, ScrollView, Pressable, Modal, SafeAreaView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

export type QuestionnaireStep = {
  key: string;
  title: string;
  subtitle: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    icon?: string;
  }>;
};

export type QuestionnaireProps = {
  visible: boolean;
  onClose: () => void;
  steps: QuestionnaireStep[];
  currentStepIndex: number;
  selectedValues: Record<string, string | null>;
  onSelectValue: (stepKey: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  progress: number;
  isGenerating: boolean;
  accentColor?: string;
};

export default function Questionnaire({
  visible,
  onClose,
  steps,
  currentStepIndex,
  selectedValues,
  onSelectValue,
  onNext,
  onBack,
  onComplete,
  progress,
  isGenerating,
  accentColor = '#ec4899', // default pink-500
}: QuestionnaireProps) {
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isComplete = currentStepIndex >= steps.length;
  const themed = useThemedStyles();
  const colors = useThemedColors();

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  const renderOption = (option: any, stepKey: string) => {
    const isSelected = selectedValues[stepKey] === option.value;

    return (
      <Pressable
        key={option.value}
        onPress={() => onSelectValue(stepKey, option.value)}
        className={themed(
          `p-6 rounded-2xl mb-4 border border-pink-100`,
          `p-6 rounded-2xl mb-4 border border-gray-700`
        )}
        style={{
          backgroundColor: isSelected ? accentColor : colors.card,
        }}
      >
        {option.icon && (
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-3">{option.icon}</Text>
            <Text
              className={`text-xl font-semibold ${
                isSelected ? 'text-white' : colors.isDark ? 'text-white' : 'text-black'
              }`}
            >
              {option.label}
            </Text>
          </View>
        )}

        {!option.icon && (
          <Text
            className={`text-xl font-semibold mb-2 ${
              isSelected ? 'text-white' : colors.isDark ? 'text-white' : 'text-black'
            }`}
          >
            {option.label}
          </Text>
        )}

        <Text
          className={`${
            isSelected ? 'text-white' : colors.isDark ? 'text-gray-300' : 'text-gray-600'
          } ${option.icon ? '' : 'ml-0'}`}
        >
          {option.description}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className={themed('flex-1 bg-gray-50', 'flex-1 bg-gray-900')}>
        {/* Header with Back Button and Progress */}
        <View className="px-4 py-4">
          <View className="flex-row items-center mb-4">
            <Pressable onPress={onBack} className="mr-4 p-2">
              <ArrowLeft size={24} color={colors.foreground} />
            </Pressable>
            <View className="flex-1">
              <View
                className={themed('bg-gray-200 rounded-full h-1', 'bg-gray-700 rounded-full h-1')}
              >
                <View
                  className="rounded-full h-1 transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {isComplete || isGenerating ? (
            <View className="flex-1 justify-center items-center">
              <View
                className={themed(
                  'bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-6',
                  'bg-green-900/20 w-20 h-20 rounded-full items-center justify-center mb-6'
                )}
              >
                <Check size={40} color="#22c55e" />
              </View>
              <Text
                className={themed(
                  'text-3xl font-bold text-center mb-4',
                  'text-3xl font-bold text-center mb-4 text-white'
                )}
              >
                Generating your goals...
              </Text>
              <Text
                className={themed(
                  'text-gray-600 text-center text-lg',
                  'text-gray-300 text-center text-lg'
                )}
              >
                This will take just a moment
              </Text>
            </View>
          ) : currentStep ? (
            <View>
              <Text
                className={themed('text-3xl font-bold mb-2', 'text-3xl font-bold mb-2 text-white')}
              >
                {currentStep.title}
              </Text>
              <Text className={themed('text-gray-600 text-lg mb-8', 'text-gray-300 text-lg mb-8')}>
                {currentStep.subtitle}
              </Text>

              {currentStep.options.map((option) => renderOption(option, currentStep.key))}
            </View>
          ) : null}
        </ScrollView>

        {!isComplete && !isGenerating && (
          <View className="p-4">
            <Button
              title={isLastStep ? 'Generate Goals' : 'Next'}
              className="w-full"
              onPress={handleNext}
              disabled={!currentStep || !selectedValues[currentStep.key]}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
