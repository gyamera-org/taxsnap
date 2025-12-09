import { useRef } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Trash2, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { ScanCard } from './scan-card';
import type { ScanResult } from '@/lib/types/scan';
import { useTranslation } from 'react-i18next';

const ACTION_WIDTH = 80;

interface SwipeableScanCardProps {
  scan: ScanResult;
  index: number;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

interface SwipeActionProps {
  progress: SharedValue<number>;
  type: 'delete' | 'save';
  isSaved?: boolean;
  onPress: () => void;
  label: string;
}

function SwipeAction({ progress, type, isSaved, onPress, label }: SwipeActionProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.8, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const isDelete = type === 'delete';
  const SaveIcon = isSaved ? BookmarkCheck : Bookmark;

  return (
    <View style={isDelete ? styles.rightActionsContainer : styles.leftActionsContainer}>
      <Animated.View style={[isDelete ? styles.deleteAction : styles.saveAction, animatedStyle]}>
        <Pressable onPress={onPress} style={styles.actionButton}>
          {isDelete ? (
            <Trash2 size={24} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <SaveIcon size={24} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text style={styles.actionText}>{label}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function SwipeableScanCard({
  scan,
  index,
  onPress,
  onToggleFavorite,
  onDelete,
}: SwipeableScanCardProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const isPending = scan.status === 'pending';

  const handleDelete = () => {
    Alert.alert(
      t('scan.deleteTitle', 'Delete Scan'),
      t('scan.deleteMessage', 'Are you sure you want to delete this scan?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onDelete?.();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    swipeableRef.current?.close();
    onToggleFavorite?.();
  };

  const isSaved = scan.is_favorite;
  const saveLabel = isSaved
    ? t('scan.unsave', 'Unsave')
    : t('scan.save', 'Save');

  // Don't allow swipe for pending scans
  if (isPending) {
    return (
      <ScanCard
        scan={scan}
        index={index}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={ACTION_WIDTH}
      rightThreshold={ACTION_WIDTH}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={(progress) => (
        <SwipeAction
          progress={progress}
          type="save"
          isSaved={isSaved}
          onPress={handleSave}
          label={saveLabel}
        />
      )}
      renderRightActions={(progress) => (
        <SwipeAction
          progress={progress}
          type="delete"
          onPress={handleDelete}
          label={t('common.delete', 'Delete')}
        />
      )}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          handleSave();
        } else if (direction === 'right') {
          handleDelete();
        }
      }}
    >
      <ScanCard
        scan={scan}
        index={index}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightActionsContainer: {
    width: ACTION_WIDTH,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftActionsContainer: {
    width: ACTION_WIDTH,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    flex: 1,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    width: ACTION_WIDTH - 8,
    marginLeft: 8,
  },
  saveAction: {
    flex: 1,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    width: ACTION_WIDTH - 8,
    marginRight: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
