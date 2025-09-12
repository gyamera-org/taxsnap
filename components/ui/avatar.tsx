import { TouchableOpacity, Image, View } from 'react-native';
import { useAvatar } from '@/lib/hooks/use-avatar';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { useCallback } from 'react';
import { useThemedColors } from '@/lib/utils/theme';

interface AvatarProps {
  size?: number;
  onPress?: () => void;
  navigateToSettings?: boolean;
}

export function Avatar({ size = 48, onPress, navigateToSettings = false }: AvatarProps) {
  const { data: avatarUrl } = useAvatar();
  const colors = useThemedColors();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
    // Navigation will be handled by parent component to avoid context issues
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: colors.muted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      activeOpacity={0.7}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <User size={size * 0.5} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  );
}

// Separate component for navigation-enabled avatar
export function NavigableAvatar({ size = 48, onPress }: Omit<AvatarProps, 'navigateToSettings'>) {
  const router = useRouter();
  const { data: avatarUrl } = useAvatar();
  const colors = useThemedColors();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      router.push('/settings');
    }
  }, [onPress, router]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: colors.muted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      activeOpacity={0.7}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <User size={size * 0.5} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  );
}
