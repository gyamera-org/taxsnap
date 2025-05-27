import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

interface Props extends TextInputProps {
  className?: string;
}

export function TextInput({ className, ...props }: Props) {
  return (
    <RNTextInput
      className={cn('border border-black px-4 py-3 rounded-2xl text-base text-gray-900', className)}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
}
