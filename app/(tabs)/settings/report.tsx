import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ChevronDown, X, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import SubPageLayout from '@/components/layouts/sub-page';
import { useAuth } from '@/context/auth-provider';
import { useTheme } from '@/context/theme-provider';

const REPORT_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
];

export default function ReportScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [reportType, setReportType] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedReportType = REPORT_TYPES.find((type) => type.value === reportType);
  const { isDark } = useTheme();

  // Auto-populate email from user authentication
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleGoBack = () => {
    router.push('/settings');
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use Supabase Edge Function
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            reportType,
            subject: subject.trim(),
            message: message.trim(),
            userEmail: email.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send report');
      }

      toast.success('Report sent successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to send report:', error);
      toast.error('Failed to send report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubPageLayout title="Report" onBack={handleGoBack}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 pt-6">
            {/* Header */}
            <View className="mb-8">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Help us improve LunaSync
              </Text>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
                Report bugs or request new features to make the app better for everyone.
              </Text>
            </View>

            {/* Report Type Selector */}
            <View className="mb-6">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'} mb-3`}>Report Type</Text>
              <TouchableOpacity
                className={`${isDark ? 'bg-card-dark border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border p-4 flex-row items-center justify-between`}
                onPress={() => setShowReportTypeModal(true)}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-base`}>
                  {selectedReportType?.label || 'Select type'}
                </Text>
                <ChevronDown size={20} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View className="mb-6">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'} mb-3`}>Your Email</Text>
              <View
                className={`${isDark ? 'bg-card-dark border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border p-4`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`${isDark ? 'text-white' : 'text-gray-800'} text-base`}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
            </View>

            {/* Subject */}
            <View className="mb-6">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'} mb-3`}>Subject</Text>
              <View
                className={`${isDark ? 'bg-card-dark border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border p-4`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder={
                    reportType === 'bug'
                      ? 'Brief description of the bug'
                      : 'Brief description of your feature request'
                  }
                  className={`${isDark ? 'text-white' : 'text-gray-800'} text-base`}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
            </View>

            {/* Message */}
            <View className="mb-8">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'} mb-3`}>
                {reportType === 'bug' ? 'Bug Description' : 'Feature Details'}
              </Text>
              <View
                className={`${isDark ? 'bg-card-dark border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border p-4`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder={
                    reportType === 'bug'
                      ? 'Please describe the bug in detail. Include steps to reproduce if possible...'
                      : 'Please describe your feature request in detail. How would this feature help you?'
                  }
                  multiline
                  numberOfLines={6}
                  className={`${isDark ? 'text-white' : 'text-gray-800'} text-base leading-relaxed`}
                  style={{ textAlignVertical: 'top', minHeight: 120 }}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
            </View>

            {/* Submit Button */}
            <View className="mb-8">
              <Button
                title="Send Report"
                onPress={handleSubmit}
                disabled={isSubmitting || !subject.trim() || !message.trim() || !email.trim()}
                loading={isSubmitting}
                className="w-full bg-blue-500"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Report Type Modal */}
      <Modal visible={showReportTypeModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-t-3xl`}>
            <View
              className={`flex-row items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-600' : 'border-gray-100'
              }`}
            >
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select Report Type
              </Text>
              <TouchableOpacity onPress={() => setShowReportTypeModal(false)}>
                <X size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View className="p-6">
              {REPORT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`flex-row items-center justify-between py-4 border-b ${
                    isDark ? 'border-gray-600' : 'border-gray-50'
                  } last:border-b-0`}
                  onPress={() => {
                    setReportType(type.value);
                    setShowReportTypeModal(false);
                  }}
                >
                  <View>
                    <Text
                      className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {type.label}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} mt-1`}>
                      {type.value === 'bug'
                        ? 'Report issues or problems with the app'
                        : 'Suggest new features or improvements'}
                    </Text>
                  </View>
                  {reportType === type.value && (
                    <View className="w-6 h-6 rounded-full bg-pink-500 items-center justify-center">
                      <Check size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View className="p-6 pt-2">
              <Button
                title="Done"
                onPress={() => setShowReportTypeModal(false)}
                className="w-full bg-pink-500"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
