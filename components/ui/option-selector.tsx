import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';

interface Option {
  id: string;
  label: string;
}

interface OptionSelectorProps {
  label: string;
  options: Option[];
  selectedOption: string | null;
  onSelect: (id: string) => void;
  icon?: React.ElementType;
}

export function OptionSelector({ label, options, selectedOption, onSelect, icon: Icon }: OptionSelectorProps) {
  const colors = useThemedColors();

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
  };

  return (
    <View style={styles.selectorContainer}>
      <View style={styles.selectorHeader}>
        {Icon && (
          <View style={[styles.selectorIcon, { backgroundColor: colors.iconBackground }]}>
            <Icon size={18} color={colors.primary} />
          </View>
        )}
        <Text style={[styles.selectorLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option.id)}
              style={[
                styles.optionChip,
                {
                  backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    gap: 12,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
