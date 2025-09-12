import { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

const DELETION_REASONS = [
  { value: 'not_using', label: "I'm not using the app anymore" },
  { value: 'too_many_notifications', label: 'Too many notifications' },
  { value: 'privacy_concerns', label: 'Privacy concerns' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'subscription_cost', label: 'Subscription is too expensive' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'account_cleanup', label: 'General account cleanup' },
  { value: 'other', label: 'Other reason' },
];

interface DeleteAccountFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string, comments?: string) => void;
  isDeleting?: boolean;
}

export function DeleteAccountFeedbackModal({
  visible,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteAccountFeedbackModalProps) {
  const { isDark } = useTheme();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [showReasonError, setShowReasonError] = useState(false);

  const handleConfirm = () => {
    if (!selectedReason) {
      setShowReasonError(true);
      return;
    }
    onConfirm(selectedReason, additionalComments.trim() || undefined);
  };

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setShowReasonError(false);
  };

  const handleClose = () => {
    setSelectedReason('');
    setAdditionalComments('');
    setShowReasonError(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-3xl w-full max-w-md`}
          style={{ maxHeight: '90%', minHeight: 400 }}
        >
          <View className={`flex-row items-center justify-between p-6 border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Why are you leaving?☹️</Text>
            <TouchableOpacity onPress={handleClose} disabled={isDeleting}>
              <X size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View className="p-6">
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base mb-6`}>
                Help us improve LunaSync by sharing your reason for leaving. Your feedback is
                valuable and helps us serve our users better.
              </Text>

              {/* Reason Selection */}
              <View className="mb-6">
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'} mb-4`}>
                  Select your main reason:
                  {showReasonError && (
                    <Text className="text-red-500 text-sm font-normal ml-2">
                      Please select a reason
                    </Text>
                  )}
                </Text>

                {DELETION_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason.value}
                    className={`flex-row items-center justify-between py-4 px-4 mb-2 rounded-2xl border ${
                      selectedReason === reason.value
                        ? 'border-pink-500 bg-pink-50'
                        : isDark 
                          ? 'border-gray-600 bg-gray-700'
                          : 'border-gray-200 bg-white'
                    } ${showReasonError && !selectedReason ? 'border-red-300' : ''}`}
                    onPress={() => handleReasonSelect(reason.value)}
                    disabled={isDeleting}
                  >
                    <Text
                      className={`text-base flex-1 ${
                        selectedReason === reason.value
                          ? 'text-pink-800 font-medium'
                          : isDark
                            ? 'text-white'
                            : 'text-gray-800'
                      }`}
                    >
                      {reason.label}
                    </Text>
                    {selectedReason === reason.value && (
                      <View className="w-6 h-6 rounded-full bg-pink-500 items-center justify-center ml-3">
                        <Check size={16} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Additional Comments */}
              <View className="mb-6">
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'} mb-3`}>
                  Additional comments (optional):
                </Text>
                <View
                  className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border p-4`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <TextInput
                    value={additionalComments}
                    onChangeText={setAdditionalComments}
                    placeholder="Is there anything specific you'd like us to know? Any features you wished we had?"
                    multiline
                    numberOfLines={4}
                    className={`${isDark ? 'text-white' : 'text-gray-800'} text-base leading-relaxed`}
                    style={{ textAlignVertical: 'top', minHeight: 100 }}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    editable={!isDeleting}
                  />
                </View>
              </View>

              {/* Warning Message */}
              <View className={`${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border rounded-2xl p-4 mb-6`}>
                <Text className={`${isDark ? 'text-red-400' : 'text-red-800'} font-semibold text-base mb-2`}>
                  ⚠️ This action cannot be undone
                </Text>
                <Text className={`${isDark ? 'text-red-300' : 'text-red-700'} text-sm`}>
                  Deleting your account will permanently remove all your data, including scanned
                  products, personal information, and account history. This cannot be reversed.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className={`p-6 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
            <View className="flex flex-row gap-2">
              <Button
                title="Cancel"
                onPress={handleClose}
                disabled={isDeleting}
                className="flex-1 bg-gray-100"
                variant="secondary"
              />
              <Button
                title={isDeleting ? 'Deleting...' : 'Delete Account'}
                onPress={handleConfirm}
                disabled={isDeleting}
                loading={isDeleting}
                className="flex-1 bg-red-500"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
