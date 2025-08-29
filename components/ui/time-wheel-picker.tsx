import { View, Modal, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

// Individual Time Wheel Component
const TimeWheelPicker = ({
  value,
  onValueChange,
  type,
}: {
  value: string;
  onValueChange: (value: string) => void;
  type: 'hour' | 'minute';
}) => {
  const items =
    type === 'hour'
      ? Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
      : Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const ITEM_HEIGHT = 60;
  const VISIBLE_ITEMS = 5;
  const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  const currentIndex = value ? items.indexOf(value) : 0;
  const translateY = useSharedValue(-currentIndex * ITEM_HEIGHT);

  const updateValue = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    onValueChange(items[clampedIndex]);
  };

  const gestureHandler = useAnimatedGestureHandler<any, { startY: number }>({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      const targetIndex = Math.round(-translateY.value / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex));

      translateY.value = withSpring(-clampedIndex * ITEM_HEIGHT);
      runOnJS(updateValue)(clampedIndex);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="items-center overflow-hidden" style={{ height: PICKER_HEIGHT, width: 90 }}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[animatedStyle]} className="items-center">
          {/* Add padding items at the start */}
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`start-${index}`}
              className="items-center justify-center"
              style={{ height: ITEM_HEIGHT, width: 80 }}
            />
          ))}

          {items.map((item, index) => {
            const isSelected = item === value;
            const selectedIndex = items.indexOf(value);
            const distanceFromSelected = Math.abs(index - selectedIndex);
            const isNearSelected = distanceFromSelected <= 2;

            return (
              <View
                key={item}
                className={`items-center justify-center ${isSelected ? 'bg-pink-50 border border-pink-200 rounded-xl' : ''}`}
                style={{ height: ITEM_HEIGHT, width: 80 }}
              >
                <Text
                  style={{
                    fontSize: isSelected ? 20 : isNearSelected ? 18 : 16,
                    fontWeight: '600',
                    color: isSelected ? '#B33791' : isNearSelected ? '#374151' : '#9ca3af',
                  }}
                >
                  {item}
                </Text>
              </View>
            );
          })}

          {/* Add padding items at the end */}
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`end-${index}`}
              className="items-center justify-center"
              style={{ height: ITEM_HEIGHT, width: 80 }}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Time Picker Modal Component
interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
  title: string;
  initialTime?: string;
}

export const TimePickerModal = ({
  visible,
  onClose,
  onSave,
  title,
  initialTime = '08:00',
}: TimePickerModalProps) => {
  const [hour, setHour] = useState(initialTime.split(':')[0]);
  const [minute, setMinute] = useState(initialTime.split(':')[1]);

  const handleSave = () => {
    const timeString = `${hour}:${minute}`;
    onSave(timeString);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-bold text-black">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-6">
            <View className="flex-row items-center justify-center gap-4">
              <View className="items-center">
                <Text className="text-sm text-gray-600 mb-2">Hour</Text>
                <TimeWheelPicker value={hour} onValueChange={setHour} type="hour" />
              </View>

              <Text className="text-2xl font-bold text-gray-400 mt-6">:</Text>

              <View className="items-center">
                <Text className="text-sm text-gray-600 mb-2">Minute</Text>
                <TimeWheelPicker value={minute} onValueChange={setMinute} type="minute" />
              </View>
            </View>
          </View>

          <View className="flex flex-row justify-between">
            <Button title="Cancel" variant="secondary" onPress={onClose} />
            <Button title="Save" variant="primary" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Export individual components
export { TimeWheelPicker };
