import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { X, Check, Clock } from 'lucide-react-native';

interface TimePickerProps {
  visible: boolean;
  currentTime: string;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
}

export function TimePicker({ visible, currentTime, onClose, onTimeSelect }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(() => {
    const [hour] = currentTime.split(':');
    return parseInt(hour, 10);
  });

  const [selectedMinute, setSelectedMinute] = useState(() => {
    const [, minute] = currentTime.split(':');
    return parseInt(minute, 10);
  });

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Auto-scroll to selected time when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        // Scroll to selected hour (48px per item)
        hourScrollRef.current?.scrollTo({
          y: selectedHour * 48,
          animated: true,
        });

        // Scroll to selected minute (48px per item, only 5-minute intervals)
        const minuteIndex = Math.floor(selectedMinute / 5);
        minuteScrollRef.current?.scrollTo({
          y: minuteIndex * 48,
          animated: true,
        });
      }, 100);
    }
  }, [visible, selectedHour, selectedMinute]);

  const handleConfirm = () => {
    const formattedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeSelect(formattedTime);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className="bg-white rounded-t-3xl">
          <View className="p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <Clock size={24} color="#374151" />
                <Text className="text-xl font-bold text-gray-900 ml-2">Set Time</Text>
              </View>
              <Pressable onPress={onClose} className="p-1">
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>

            {/* Time Display */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-center text-3xl font-bold text-gray-900">
                {selectedHour.toString().padStart(2, '0')}:
                {selectedMinute.toString().padStart(2, '0')}
              </Text>
            </View>

            {/* Time Selectors */}
            <View className="flex-row gap-4 mb-6">
              {/* Hour Selector */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Hour</Text>
                <ScrollView
                  ref={hourScrollRef}
                  className="border border-gray-200 rounded-xl max-h-40"
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => (
                    <Pressable
                      key={hour}
                      onPress={() => setSelectedHour(hour)}
                      className={`p-3 ${selectedHour === hour ? 'bg-pink-50' : 'bg-white'}`}
                    >
                      <Text
                        className={`text-center ${
                          selectedHour === hour ? 'text-pink-600 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Minute Selector */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Minute</Text>
                <ScrollView
                  ref={minuteScrollRef}
                  className="border border-gray-200 rounded-xl max-h-40"
                  showsVerticalScrollIndicator={false}
                >
                  {minutes
                    .filter((m) => m % 5 === 0)
                    .map((minute) => (
                      <Pressable
                        key={minute}
                        onPress={() => setSelectedMinute(minute)}
                        className={`p-3 ${selectedMinute === minute ? 'bg-pink-50' : 'bg-white'}`}
                      >
                        <Text
                          className={`text-center ${
                            selectedMinute === minute
                              ? 'text-pink-600 font-semibold'
                              : 'text-gray-700'
                          }`}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable onPress={onClose} className="flex-1 bg-gray-100 rounded-xl p-4">
                <Text className="text-center text-gray-700 font-medium">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                className="flex-1 bg-pink-500 rounded-xl p-4 flex-row items-center justify-center"
              >
                <Check size={20} color="white" />
                <Text className="text-white font-medium ml-2">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
