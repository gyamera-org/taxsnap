import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';
import { useThemedColors } from '@/lib/utils/theme';

interface Props extends TextInputProps {
  className?: string;
}

export function TextInput({ className, multiline, ...props }: Props) {
  const colors = useThemedColors();

  return (
    <RNTextInput
      className={cn(
        'border border-black rounded-2xl text-base text-gray-900',
        multiline ? 'min-h-20 px-4 py-3' : 'h-12 px-4',
        className
      )}
      placeholderTextColor={colors.gray[400]}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...props}
    />
  );
}
