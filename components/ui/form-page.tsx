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
  const height = multiline ? 56 * numberOfLines : 56;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrapper, { height }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          keyboardAppearance="light"
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !editable && styles.inputDisabled,
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
  return (
    <View style={styles.toggleWrapper}>
      <View style={styles.toggleContent}>
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleLabel}>{label}</Text>
          {description && (
            <Text style={styles.toggleDescription}>{description}</Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D1D5DB', true: '#0D9488' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

function SkeletonField() {
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
        style={[styles.skeletonLabel, { opacity }]}
      />
      <Animated.View
        style={[styles.skeletonInput, { opacity }]}
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={{ opacity: !disabled && !loading ? 1 : 0.4 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#0D9488" />
      ) : (
        <Text style={styles.saveButtonText}>{label}</Text>
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
    color: '#6B7280',
    marginLeft: 4,
  },
  inputWrapper: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    color: '#111827',
  },
  inputMultiline: {
    paddingVertical: 16,
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
  toggleWrapper: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    color: '#111827',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  skeletonLabel: {
    height: 16,
    width: 80,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
  },
  skeletonInput: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
  },
});
