import React from 'react';
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import SubPageLayout from '@/components/layouts/sub-page';
import { useTheme } from '@/context/theme-provider';

const citations = [
  {
    title: 'Eating for Exercise and Sports',
    source: 'U.S. Department of Agriculture',
    url: 'https://www.nutrition.gov/topics/basic-nutrition/eating-exercise-and-sports',
  },
  {
    title: 'Body Mass Index (BMI)',
    source: 'World Health Organization',
    url: 'https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index',
  },
  {
    title: 'Calorie Counting Made Easy',
    source: 'Harvard Medical School',
    url: 'https://www.health.harvard.edu/staying-healthy/calorie-counting-made-easy',
  },
  {
    title: 'Menstrual Cycle & Health',
    source: 'Cleveland Clinic',
    url: 'https://my.clevelandclinic.org/health/articles/10132-menstrual-cycle',
  },
];

export default function HowLunaWorksScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleBack = () => {
    router.push('/settings');
  };

  return (
    <SubPageLayout title="How Luna Works" onBack={handleBack}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-4">
          <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6 leading-6`}>
            Luna combines scientific evidence with your personal data and behavior to provide tailored recommendations.
          </Text>

          {/* How We Make Recommendations */}
          <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-6 mb-4 shadow-sm`}>
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>How We Make Recommendations</Text>
            <View className="gap-4">
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Scientific research from medical institutions</Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Your personal tracking data and patterns</Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Menstrual cycle phase considerations</Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Adaptive learning from your responses</Text>
            </View>
          </View>

          {/* Period Calculations */}
          <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-6 mb-4 shadow-sm`}>
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Period Predictions</Text>
            <View className="gap-4">
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Historical cycle data and patterns</Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Average cycle length (21-35 days)</Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Luteal phase tracking</Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• Medical guidelines for variations</Text>
            </View>
          </View>

          {/* Medical Sources */}
          <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-6 mb-4 shadow-sm`}>
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Medical Sources</Text>
            <View className="gap-4">
              {citations.map((citation, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between py-3"
                  onPress={() => Linking.openURL(citation.url)}
                >
                  <View className="flex-1 mr-3">
                    <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {citation.title}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {citation.source}
                    </Text>
                  </View>
                  <ExternalLink size={18} color={isDark ? '#D1D5DB' : '#6B7280'} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Disclaimer */}
          <View className={`${isDark ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-200'} border rounded-2xl p-5 mb-8`}>
            <Text className={`text-base ${isDark ? 'text-blue-200' : 'text-blue-800'} font-medium mb-3`}>Medical Disclaimer</Text>
            <Text className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-700'} leading-6`}>
              This information is for educational purposes only. Consult a healthcare professional for personalized medical advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}