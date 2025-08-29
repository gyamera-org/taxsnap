import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Baby,
  Droplets,
  Heart,
  Moon,
  Sun,
  Sparkles,
  Zap,
  Flower2,
  Calendar,
  Info,
  X,
} from 'lucide-react-native';
import { useState } from 'react';

interface CyclePhase {
  name: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  dayRange: string;
  icon: any;
  color: string;
  bgColor: string;
  fertilityLevel: 'low' | 'high' | 'peak';
  symptoms: string[];
  advice: string[];
  symptomExplanations?: { [key: string]: string };
  detailedActivities?: string[];
}

interface FertilityWindowProps {
  fertilityWindow: {
    daysToStart: number;
    daysToEnd: number;
    isInWindow: boolean;
    ovulationDay: number;
    currentPhase: CyclePhase;
    dayInCycle: number;
    nextPhase: CyclePhase | null;
    daysToNextPhase: number;
  } | null;
}

export const FertilityWindow = ({ fertilityWindow }: FertilityWindowProps) => {
  const [showSymptomInfo, setShowSymptomInfo] = useState(false);
  const [showActivityInfo, setShowActivityInfo] = useState(false);

  if (!fertilityWindow) return null;

  const {
    currentPhase,
    dayInCycle,
    nextPhase,
    daysToNextPhase,
    isInWindow,
    daysToStart,
    ovulationDay,
  } = fertilityWindow;

  const getFertilityIcon = () => {
    switch (currentPhase.fertilityLevel) {
      case 'peak':
        return Baby;
      case 'high':
        return Heart;
      default:
        return currentPhase.icon;
    }
  };

  const FertilityIcon = getFertilityIcon();

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
      {/* Header with Phase */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: currentPhase.bgColor }}
          >
            <currentPhase.icon size={24} color={currentPhase.color} />
          </View>
          <View>
            <Text className="text-lg font-bold text-black">{currentPhase.name}</Text>
            <Text className="text-sm text-gray-500">
              Day {dayInCycle} • {currentPhase.dayRange}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <View
            className={`px-3 py-1 rounded-full ${
              currentPhase.fertilityLevel === 'peak'
                ? 'bg-pink-100'
                : currentPhase.fertilityLevel === 'high'
                  ? 'bg-orange-100'
                  : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                currentPhase.fertilityLevel === 'peak'
                  ? 'text-pink-600'
                  : currentPhase.fertilityLevel === 'high'
                    ? 'text-orange-600'
                    : 'text-gray-600'
              }`}
            >
              {currentPhase.fertilityLevel === 'peak'
                ? 'Peak Fertility'
                : currentPhase.fertilityLevel === 'high'
                  ? 'High Fertility'
                  : 'Low Fertility'}
            </Text>
          </View>
        </View>
      </View>

      {/* Fertility Prediction */}
      <View className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-4">
        <View className="items-center">
          <FertilityIcon size={28} color="#EC4899" />
          <Text className="text-sm text-gray-600 mt-2 mb-1">Fertility Prediction</Text>

          {isInWindow ? (
            <Text className="text-xl font-bold text-pink-600">Fertile window is now!</Text>
          ) : daysToStart > 0 ? (
            <>
              <Text className="text-lg font-semibold text-black">Fertile window in</Text>
              <Text className="text-2xl font-bold text-pink-600">{daysToStart} days</Text>
            </>
          ) : ovulationDay > 0 ? (
            <>
              <Text className="text-lg font-semibold text-black">Ovulation in</Text>
              <Text className="text-2xl font-bold text-purple-600">{ovulationDay} days</Text>
            </>
          ) : (
            <Text className="text-lg font-semibold text-gray-600">Fertile window passed</Text>
          )}
        </View>
      </View>

      {/* Quick Tips */}
      {/* <View className="flex-row gap-3"> */}
      {/* Main Symptom */}
      {/* <TouchableOpacity
          onPress={() => setShowSymptomInfo(true)}
          className="flex-1 bg-blue-50 rounded-xl p-3"
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-semibold text-blue-800">What to Expect</Text>
            <Info size={12} color="#1E40AF" />
          </View>
          <Text className="text-xs text-blue-700">{currentPhase.symptoms[0]}</Text>
        </TouchableOpacity> */}

      {/* Main Advice */}
      {/* <TouchableOpacity
          onPress={() => setShowActivityInfo(true)}
          className="flex-1 bg-green-50 rounded-xl p-3"
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-semibold text-green-800">Best For</Text>
            <Info size={12} color="#059669" />
          </View>
          <Text className="text-xs text-green-700">{currentPhase.advice[0]}</Text>
        </TouchableOpacity> */}
      {/* </View> */}

      {/* Symptom Info Modal */}
      <Modal
        visible={showSymptomInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSymptomInfo(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[80%]">
            {/* Header with solid pink background */}
            <View style={{ backgroundColor: '#EC4899' }} className="px-6 pt-8 pb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    className="rounded-full p-2 mr-3"
                  >
                    <Sparkles size={20} color="white" />
                  </View>
                  <Text className="text-xl font-bold text-white">Symptoms Explained</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowSymptomInfo(false)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  className="rounded-full p-1.5"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm mt-2">
                Understanding your body during this phase
              </Text>
            </View>

            {/* Content - Scrollable */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="p-6">
                {currentPhase.symptoms.map((symptom, index) => (
                  <View
                    key={index}
                    style={{ backgroundColor: '#FDF2F8', marginBottom: 16 }}
                    className="rounded-xl p-4 border border-pink-100"
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="bg-pink-100 rounded-full p-1.5 mr-3">
                        <Heart size={12} color="#EC4899" />
                      </View>
                      <Text className="text-base font-semibold text-gray-800">{symptom}</Text>
                    </View>
                    <Text className="text-sm text-gray-600 leading-5 ml-8">
                      {currentPhase.symptomExplanations?.[symptom] ||
                        'Normal symptom during this phase of your cycle.'}
                    </Text>
                  </View>
                ))}

                {/* Decorative bottom */}
                <View className="flex-row justify-center mt-6">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-pink-200 rounded-full mr-1" />
                    <View className="w-2 h-2 bg-pink-200 rounded-full mr-1" />
                    <View className="w-2 h-2 bg-pink-200 rounded-full" />
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Activity Info Modal */}
      <Modal
        visible={showActivityInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActivityInfo(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[80%]">
            {/* Header with solid purple background */}
            <View style={{ backgroundColor: '#8B5CF6' }} className="px-6 pt-8 pb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    className="rounded-full p-2 mr-3"
                  >
                    <Flower2 size={20} color="white" />
                  </View>
                  <Text className="text-xl font-bold text-white">Recommended Activities</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowActivityInfo(false)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  className="rounded-full p-1.5"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm mt-2">
                Activities that work best with your body during the{' '}
                {currentPhase.name.toLowerCase()}
              </Text>
            </View>

            {/* Content - Scrollable */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="p-6">
                {(currentPhase.detailedActivities || []).map((activity, index) => (
                  <View
                    key={index}
                    style={{ backgroundColor: '#F3E8FF', marginBottom: 12 }}
                    className="rounded-xl p-4 border border-purple-100"
                  >
                    <View className="flex-row items-center">
                      <View className="bg-purple-100 rounded-full p-1.5 mr-3">
                        <Sparkles size={12} color="#8B5CF6" />
                      </View>
                      <Text className="text-sm text-gray-700 flex-1 leading-5">{activity}</Text>
                    </View>
                  </View>
                ))}

                {/* Decorative elements */}
                <View className="flex-row justify-center mt-6">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-purple-200 rounded-full mr-2" />
                    <View className="w-3 h-3 bg-pink-300 rounded-full mr-2" />
                    <View className="w-2 h-2 bg-purple-200 rounded-full" />
                  </View>
                </View>

                {/* Motivational message */}
                <View
                  style={{ backgroundColor: '#FFEEFF' }}
                  className="rounded-xl p-4 mt-4 border border-pink-100"
                >
                  <Text className="text-center text-sm text-gray-700 italic">
                    ✨ Listen to your body and choose what feels right today ✨
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
