import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';

interface OnboardingOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  index?: number;
}

export function OnboardingOption({ label, selected, onPress, index = 0 }: OnboardingOptionProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(80 + index * 30).duration(300)}>
      <Pressable
        onPress={handlePress}
        style={[styles.option, selected && styles.optionSelected]}
      >
        {/* Selection indicator */}
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Check size={14} color="#ffffff" strokeWidth={3} />}
        </View>

        {/* Label */}
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionSelected: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(156, 163, 175, 0.5)',
  },
  checkboxSelected: {
    backgroundColor: '#0D9488',
    borderWidth: 0,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '400',
  },
  labelSelected: {
    color: '#0D9488',
    fontWeight: '600',
  },
});
