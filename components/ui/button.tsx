import { Pressable, View, type PressableProps } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'link' | 'secondary';
  label: string;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  label,
  className,
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'items-center justify-center',
        variant === 'primary' && 'bg-black p-4 rounded-full mb-4',
        variant === 'link' && 'flex-row',
        variant === 'secondary' && 'bg-gray-100 p-4 rounded-full mb-4',
        className,
        disabled && 'opacity-50'
      )}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
        pressed && { opacity: 0.8 },
      ]}
      {...props}
      disabled={disabled}
    >
      <Text
        variant="button"
        className={cn(variant === 'primary' ? 'text-white' : 'text-black', 'font-bold')}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface ButtonWithIconProps extends ButtonProps {
  icon: React.ElementType;
}

export function ButtonWithIcon({
  variant = 'primary',
  label,
  onPress,
  className = '',
  icon: Icon,
  children,
}: ButtonWithIconProps) {
  return (
    <Pressable onPress={onPress} className={`${className}`}>
      {children || (
        <View
          className={cn(
            'flex-row items-center justify-center px-2 py-1 rounded-xl border border-black'
          )}
        >
          <Text className={cn('text-base font-medium text-black')}>{label}</Text>
          {Icon && <Icon size={20} className="ml-2" />}
        </View>
      )}
    </Pressable>
  );
}
