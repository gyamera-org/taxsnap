import { useRef, useEffect, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Switch,
} from 'react-native';
import { PageLayout } from '@/components/layouts';
import { useThemedColors } from '@/lib/utils/theme';

import type { KeyboardTypeOptions } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
}: FormFieldProps) {
  const colors = useThemedColors();
  const height = multiline ? 56 * numberOfLines : 56;

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            height,
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          keyboardAppearance={colors.isDark ? 'dark' : 'light'}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            styles.input,
            { color: colors.inputText },
            multiline && styles.inputMultiline,
            !editable && { color: colors.textMuted },
          ]}
        />
      </View>
    </View>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleField({
  label,
  description,
  value,
  onValueChange,
}: ToggleFieldProps) {
  const colors = useThemedColors();

  return (
    <View
      style={[
        styles.toggleWrapper,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.toggleContent}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
          {description && (
            <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>
    </View>
  );
}

function SkeletonField() {
  const colors = useThemedColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.fieldContainer}>
      <Animated.View
        style={[styles.skeletonLabel, { opacity, backgroundColor: colors.border }]}
      />
      <Animated.View
        style={[styles.skeletonInput, { opacity, backgroundColor: colors.backgroundSecondary }]}
      />
    </View>
  );
}

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 3 }: FormSkeletonProps) {
  return (
    <View style={styles.formContainer}>
      {Array.from({ length: fields }).map((_, i) => (
        <SkeletonField key={i} />
      ))}
    </View>
  );
}

interface FormPageProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  skeletonFields?: number;
  rightAction?: ReactNode;
}

export function FormPage({
  title,
  children,
  isLoading = false,
  skeletonFields = 3,
  rightAction,
}: FormPageProps) {
  return (
    <PageLayout title={title} showBackButton rightAction={rightAction}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <FormSkeleton fields={skeletonFields} />
        ) : (
          <View style={styles.formContainer}>{children}</View>
        )}
      </ScrollView>
    </PageLayout>
  );
}

interface SaveButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export function SaveButton({
  onPress,
  disabled = false,
  loading = false,
  label = 'Save',
}: SaveButtonProps) {
  const colors = useThemedColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={{ opacity: !disabled && !loading ? 1 : 0.4 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Text style={[styles.saveButtonText, { color: colors.primary }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  formContainer: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  inputMultiline: {
    paddingVertical: 16,
  },
  toggleWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggleDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  skeletonLabel: {
    height: 16,
    width: 80,
    borderRadius: 4,
    marginLeft: 4,
  },
  skeletonInput: {
    height: 56,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
