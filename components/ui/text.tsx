import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/context/theme-provider';

interface CustomTextProps extends Omit<TextProps, 'className'> {
  variant?: 'heading' | 'body' | 'button';
  bold?: boolean;
  className?: string;
}

export function Text({ variant = 'body', bold, style, className, ...restProps }: CustomTextProps) {
  const { isDark } = useTheme();
  
  return (
    <RNText
      className={cn(
        'text-base', // base style
        variant === 'heading' && 'text-3xl font-bold text-center',
        variant === 'button' && 'text-base text-center',
        bold && 'font-bold',
        // Default text color based on theme - can be overridden by className
        !className?.includes('text-') && (isDark ? 'text-white' : 'text-black'),
        className
      )}
      style={style}
      {...restProps}
    />
  );
}
