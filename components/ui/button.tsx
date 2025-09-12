import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { useThemedStyles } from '@/lib/utils/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  preIcon?: React.ReactNode;
  postIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  size = 'medium',
  disabled,
  className = '',
  preIcon,
  postIcon,
  ...props
}: ButtonProps) {
  const themed = useThemedStyles();

  const getButtonClasses = () => {
    let baseClasses = 'rounded-full items-center justify-center flex-row';

    // Size classes
    switch (size) {
      case 'small':
        baseClasses += ' py-2 px-6';
        break;
      case 'large':
        baseClasses += ' py-5 px-8';
        break;
      default: // medium
        baseClasses += ' py-4 px-6';
        break;
    }

    // Variant classes
    if (variant === 'primary') {
      baseClasses += themed(' bg-pink-500', ' bg-pink-600');
    } else {
      baseClasses += themed(' bg-white border border-pink-500', ' bg-gray-800 border border-pink-600');
    }

    // Disabled/loading state
    if (disabled || loading) {
      baseClasses += ' opacity-70';
    }

    return `${baseClasses} ${className}`;
  };

  const getTextClasses = () => {
    let textClasses = 'font-bold';

    // Size-based text classes
    switch (size) {
      case 'small':
        textClasses += ' text-sm';
        break;
      case 'large':
        textClasses += ' text-xl';
        break;
      default: // medium
        textClasses += ' text-lg';
        break;
    }

    // Variant-based text color
    if (variant === 'primary') {
      textClasses += ' text-white';
    } else {
      textClasses += themed(' text-pink-500', ' text-pink-400');
    }

    return textClasses;
  };

  return (
    <TouchableOpacity className={getButtonClasses()} disabled={disabled || loading} {...props}>
      {preIcon && !loading && <View className="mr-2">{preIcon}</View>}
      <Text className={getTextClasses()}>{loading ? 'Loading...' : title}</Text>
      {postIcon && !loading && <View className="ml-2">{postIcon}</View>}
    </TouchableOpacity>
  );
}

export default Button;
