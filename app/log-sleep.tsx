import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { Moon, Sun, Star, X } from 'lucide-react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

// Time Wheel Picker Component
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
      {/* Selection indicator */}

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

// Circular Sleep Clock Component
const SleepClock = ({
  bedTime,
  wakeTime,
  size = 200,
}: {
  bedTime: string;
  wakeTime: string;
  size?: number;
}) => {
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;

  const calculateTimeAngle = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    // Convert to 24-hour format angle (0° = 12 o'clock)
    let angle = (totalMinutes / (24 * 60)) * 360 - 90;
    // Ensure positive angle
    if (angle < 0) angle += 360;
    return angle % 360;
  };

  const calculateDuration = (bedTime: string, wakeTime: string) => {
    const bed = new Date(`2024-01-01 ${bedTime}`);
    let wake = new Date(`2024-01-01 ${wakeTime}`);

    if (wake <= bed) {
      wake = new Date(`2024-01-02 ${wakeTime}`);
    }

    const diffMs = wake.getTime() - bed.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, duration: `${hours}h ${minutes}m` };
  };

  if (!bedTime || !wakeTime) {
    return (
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="16"
          />
        </Svg>
        <View className="absolute items-center">
          <Text className="text-3xl font-bold text-gray-400">- -</Text>
          <Text className="text-sm text-gray-400 mt-1">sleep duration</Text>
        </View>
      </View>
    );
  }

  const bedAngle = calculateTimeAngle(bedTime);
  const wakeAngle = calculateTimeAngle(wakeTime);
  const { duration } = calculateDuration(bedTime, wakeTime);

  // Calculate arc path for sleep duration
  const bedRadians = (bedAngle * Math.PI) / 180;
  const wakeRadians = (wakeAngle * Math.PI) / 180;

  const bedX = size / 2 + radius * Math.cos(bedRadians);
  const bedY = size / 2 + radius * Math.sin(bedRadians);
  const wakeX = size / 2 + radius * Math.cos(wakeRadians);
  const wakeY = size / 2 + radius * Math.sin(wakeRadians);

  // Calculate proper arc flag for overnight sleep
  let angleDiff = wakeAngle - bedAngle;
  if (angleDiff < 0) angleDiff += 360; // Handle overnight case
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="16"
        />

        {/* Sleep duration arc */}
        <Path
          d={`M ${bedX} ${bedY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${wakeX} ${wakeY}`}
          fill="none"
          stroke="url(#sleepGradient)"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </Svg>

      {/* Sleep duration text */}
      <View className="absolute items-center">
        <Text className="text-3xl font-bold text-black">{duration}</Text>
        <Text className="text-sm text-gray-400 mt-1">sleep duration</Text>
      </View>

      {/* Bedtime icon */}
      <View
        className="absolute w-10 h-10 bg-purple-500 rounded-full items-center justify-center shadow-lg"
        style={{
          left: bedX - 20,
          top: bedY - 20,
        }}
      >
        <Moon size={18} color="white" />
      </View>

      {/* Wake time icon */}
      <View
        className="absolute w-10 h-10 bg-orange-400 rounded-full items-center justify-center shadow-lg"
        style={{
          left: wakeX - 20,
          top: wakeY - 20,
        }}
      >
        <Sun size={18} color="white" />
      </View>
    </View>
  );
};

export default function LogSleepScreen() {
  const [bedHour, setBedHour] = useState<string>('22');
  const [bedMinute, setBedMinute] = useState<string>('00');
  const [wakeHour, setWakeHour] = useState<string>('07');
  const [wakeMinute, setWakeMinute] = useState<string>('00');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTime, setEditingTime] = useState<'bedtime' | 'waketime' | null>(null);

  const bedTime = `${bedHour}:${bedMinute}`;
  const wakeTime = `${wakeHour}:${wakeMinute}`;

  const openTimePicker = (type: 'bedtime' | 'waketime') => {
    setEditingTime(type);
    setShowTimePicker(true);
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setEditingTime(null);
  };

  const getCurrentHour = () => (editingTime === 'bedtime' ? bedHour : wakeHour);
  const getCurrentMinute = () => (editingTime === 'bedtime' ? bedMinute : wakeMinute);

  const setCurrentHour = (hour: string) => {
    if (editingTime === 'bedtime') setBedHour(hour);
    else setWakeHour(hour);
  };

  const setCurrentMinute = (minute: string) => {
    if (editingTime === 'bedtime') setBedMinute(minute);
    else setWakeMinute(minute);
  };

  const qualityOptions = [
    { value: 1, label: 'Poor', emoji: '😴' },
    { value: 2, label: 'Fair', emoji: '😐' },
    { value: 3, label: 'Good', emoji: '🙂' },
    { value: 4, label: 'Great', emoji: '😊' },
    { value: 5, label: 'Excellent', emoji: '😍' },
  ];

  const handleSave = () => {
    if (bedTime && wakeTime && sleepQuality) {
      router.back();
    }
  };

  return (
    <SubPageLayout
      title="Sleep"
      rightElement={
        <Button
          title="Log"
          onPress={handleSave}
          variant="primary"
          size="small"
          disabled={!bedTime || !wakeTime || !sleepQuality}
        />
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-4 py-8">
          {/* Circular Sleep Clock */}
          <View className="items-center mb-8">
            <SleepClock bedTime={bedTime} wakeTime={wakeTime} size={240} />
          </View>

          {/* Time Buttons */}
          <View className="w-full mb-8 flex-row gap-4">
            {/* Bedtime Button */}
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              onPress={() => openTimePicker('bedtime')}
            >
              <View className="items-center">
                <View className="flex-row items-center mb-2">
                  <Moon size={16} color="#8B5CF6" />
                  <Text className="text-sm font-medium text-gray-500 ml-1">Bedtime</Text>
                </View>
                <Text className="text-2xl font-bold text-black">{bedTime}</Text>
              </View>
            </TouchableOpacity>

            {/* Wake Time Button */}
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              onPress={() => openTimePicker('waketime')}
            >
              <View className="items-center">
                <View className="flex-row items-center mb-2">
                  <Sun size={16} color="#F59E0B" />
                  <Text className="text-sm font-medium text-gray-500 ml-1">Wake up</Text>
                </View>
                <Text className="text-2xl font-bold text-black">{wakeTime}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Sleep Quality */}
          <View className="w-full mb-8">
            <View className="flex-row items-center justify-center mb-4">
              <Star size={16} color="#6366F1" />
              <Text className="text-sm font-medium text-gray-600 ml-1">Sleep Quality</Text>
            </View>
            <View className="flex-row justify-between gap-2">
              {qualityOptions.map((quality) => (
                <TouchableOpacity
                  key={quality.value}
                  onPress={() => setSleepQuality(quality.value)}
                  className="flex-1"
                >
                  <View
                    className={`bg-white rounded-xl p-3 items-center shadow-sm border border-gray-100 ${
                      sleepQuality === quality.value ? 'border-pink-500' : 'border-gray-100'
                    }`}
                  >
                    <Text className="text-2xl mb-1">{quality.emoji}</Text>
                    <Text
                      className="font-medium text-xs text-center"
                      style={{
                        color: sleepQuality === quality.value ? '#6366F1' : '#6B7280',
                      }}
                    >
                      {quality.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Bottom Sheet */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={closeTimePicker}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">
                {editingTime === 'bedtime' ? 'Set Bedtime' : 'Set Wake Time'}
              </Text>
              <TouchableOpacity onPress={closeTimePicker}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-8">
              <View className="flex-row items-center justify-center gap-4">
                <TimeWheelPicker
                  value={getCurrentHour()}
                  onValueChange={setCurrentHour}
                  type="hour"
                />
                <Text className="text-4xl font-bold text-gray-300">:</Text>
                <TimeWheelPicker
                  value={getCurrentMinute()}
                  onValueChange={setCurrentMinute}
                  type="minute"
                />
              </View>
            </View>

            <Button title="Done" onPress={closeTimePicker} variant="primary" size="large" />
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
