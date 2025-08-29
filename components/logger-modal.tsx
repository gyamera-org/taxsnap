import { View, TouchableOpacity, Pressable, Animated, PanResponder } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Activity, Camera, Droplets, Pill, Moon, Smile, Apple, Bed } from 'lucide-react-native';

interface LoggerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LoggerModal({ visible, onClose }: LoggerModalProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  // Get current meal type based on time of day
  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    onClose();
  };

  const handleAction = (action: () => void) => {
    handleClose();
    // Small delay to allow modal to close before navigation
    setTimeout(action, 100);
  };

  // Reset closing flag when modal becomes visible
  if (visible && isClosing.current) {
    isClosing.current = false;
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to vertical drags and not when closing
      return (
        !isClosing.current &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        Math.abs(gestureState.dy) > 10
      );
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only allow downward drags and not when closing
      if (!isClosing.current && gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (isClosing.current) return;

      if (gestureState.dy > 100) {
        // If dragged down more than 100px, close the modal
        isClosing.current = true;
        Animated.timing(translateY, {
          toValue: 300,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          translateY.setValue(0);
          onClose();
        });
      } else {
        // Snap back to original position
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!visible) return null;

  return (
    <Pressable className="flex-1 bg-black/30" onPress={handleClose} style={{ flex: 1 }}>
      <View className="flex-1 justify-end">
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
          {...panResponder.panHandlers}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Logger Content */}
            <View className="bg-white rounded-t-3xl px-4 pt-6 pb-8 mx-4 mb-4">
              {/* Close Handle */}
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

              {/* Quick Actions Grid - 8 balanced actions */}
              <View className="flex-row flex-wrap justify-between">
                {/* Row 1 */}
                <LoggerCard
                  title="Log exercise"
                  icon={Activity}
                  iconColor="#F59E0B"
                  bgColor="#FEF3E2"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/log-exercise' as any);
                    })
                  }
                />

                <LoggerCard
                  title="Scan food"
                  icon={Camera}
                  iconColor="#3B82F6"
                  bgColor="#EFF6FF"
                  onPress={() =>
                    handleAction(() => {
                      router.push(`/scan-food?mealType=${getCurrentMealType()}` as any);
                    })
                  }
                />

                {/* Row 2 */}
                <LoggerCard
                  title="Log mood"
                  icon={Smile}
                  iconColor="#8B5CF6"
                  bgColor="#F3F4F6"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/log-mood' as any);
                    })
                  }
                />

                <LoggerCard
                  title="Log sleep"
                  icon={Bed}
                  iconColor="#8B5CF6"
                  bgColor="#F3F4F6"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/log-sleep' as any);
                    })
                  }
                />

                {/* Row 3 */}
                <LoggerCard
                  title="Water intake"
                  icon={Droplets}
                  iconColor="#06B6D4"
                  bgColor="#ECFEFF"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/log-water' as any);
                    })
                  }
                />

                <LoggerCard
                  title="Period tracking"
                  icon={Moon}
                  iconColor="#EC4899"
                  bgColor="#FDF2F8"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/period-tracker' as any);
                    })
                  }
                />

                {/* Row 4 */}
                <LoggerCard
                  title="Log supplements"
                  icon={Pill}
                  iconColor="#F59E0B"
                  bgColor="#FFFBEB"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/log-supplements' as any);
                    })
                  }
                />

                <LoggerCard
                  title="Log meal"
                  icon={Apple}
                  iconColor="#10B981"
                  bgColor="#F0FDF4"
                  onPress={() =>
                    handleAction(() => {
                      router.push('/log-meal' as any);
                    })
                  }
                />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Pressable>
  );
}

function LoggerCard({
  title,
  icon: Icon,
  iconColor,
  bgColor,
  onPress,
}: {
  title: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="w-[48%] mb-4">
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={24} color={iconColor} />
        </View>
        <Text className="text-base font-semibold text-black">{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
