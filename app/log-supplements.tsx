import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { useAppNavigation } from '@/lib/hooks/use-navigation';
import { Plus, X, Check } from 'lucide-react-native';

// Import real data hooks
import {
  useUserSupplements,
  useTodaysSupplements,
  useLogSupplement,
  useAddSupplement,
} from '@/lib/hooks/use-supplements';
import { getTodayDateString, getLocalTimeString } from '@/lib/utils/date-helpers';

export default function LogSupplementsScreen() {
  const [selectedSupplements, setSelectedSupplements] = useState<{ [key: string]: boolean }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplementName, setNewSupplementName] = useState('');
  const [newSupplementDose, setNewSupplementDose] = useState('');

  // Use enhanced navigation hook
  const { safeNavigate } = useAppNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Use real data
  const { data: userSupplements = [] } = useUserSupplements();
  const { data: todaysSupplements = [] } = useTodaysSupplements();
  const logSupplement = useLogSupplement();
  const addSupplement = useAddSupplement();

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const addCustomSupplement = () => {
    if (newSupplementName.trim() && newSupplementDose.trim()) {
      addSupplement.mutate({
        name: newSupplementName.trim(),
        default_dosage: newSupplementDose.trim(),
        frequency: 'Daily',
        importance: 'medium',
        days_of_week: ['Daily'],
        is_active: true,
      });
      setNewSupplementName('');
      setNewSupplementDose('');
      setShowAddModal(false);
    }
  };

  const toggleSupplement = (supplementName: string) => {
    setSelectedSupplements((prev) => ({
      ...prev,
      [supplementName]: !prev[supplementName],
    }));
  };

  const handleSave = () => {
    const today = getTodayDateString();

    // Log each selected supplement
    Object.entries(selectedSupplements).forEach(([supplementName, taken]) => {
      if (taken) {
        logSupplement.mutate({
          date: today,
          supplement_name: supplementName,
          taken: true,
          time_logged: getLocalTimeString(), // Add local time
        });
      }
    });

    // Navigate back to the cycle screen
    safeNavigate('/(tabs)/cycle');
  };

  const isFormValid = Object.values(selectedSupplements).some((taken) => taken);

  return (
    <View className="flex-1" style={{ backgroundColor: '#F5F1E8' }}>
      <SubPageLayout
        title="Supplements"
        onBack={() => router.back()}
        rightElement={
          <Button
            title="Log"
            onPress={handleSave}
            variant="primary"
            size="small"
            disabled={!isFormValid || logSupplement.isPending}
            loading={logSupplement.isPending}
          />
        }
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              className="flex-1 px-4 py-6"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* Header */}
              <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-4">Daily Supplements</Text>
                <Text className="text-gray-600 text-base">
                  Mark the supplements you've taken today.
                </Text>
              </View>

              {/* Today's Summary */}
              {/* {isFormValid && (
                <Animated.View
                  className="bg-white rounded-2xl p-4 mb-6 border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="font-semibold text-gray-900 text-base mb-3">Today's Plan</Text>
                  <View>
                    {Object.entries(selectedSupplements)
                      .filter(([, taken]) => taken)
                      .map(([supplementName], index) => {
                        const supplement = userSupplements.find(
                          (s: any) => s.name === supplementName
                        );
                        return (
                          <View
                            key={supplementName}
                            className="flex-row justify-between items-center py-2"
                            style={{
                              borderBottomWidth:
                                index <
                                Object.entries(selectedSupplements).filter(([, taken]) => taken)
                                  .length -
                                  1
                                  ? 1
                                  : 0,
                              borderBottomColor: '#F3F4F6',
                            }}
                          >
                            <Text className="text-gray-900 font-medium">{supplementName}</Text>
                            <Text className="text-gray-600 text-sm">
                              {supplement?.default_dosage}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                </Animated.View>
              )} */}

              {/* Supplements List */}
              <View className="mb-6">
                {userSupplements.length === 0 ? (
                  <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    className="flex-row items-center p-6 rounded-2xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderWidth: 2,
                      borderColor: '#E5E7EB',
                      borderStyle: 'dashed',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <Plus size={24} color="#9CA3AF" />
                    <Text className="text-gray-600 text-lg ml-3">Add supplement</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ gap: 16 }}>
                    {userSupplements.map((supplement: any) => {
                      const isSelected = selectedSupplements[supplement.name] || false;
                      return (
                        <TouchableOpacity
                          key={supplement.id}
                          onPress={() => toggleSupplement(supplement.name)}
                          className={`flex-row items-center p-6 rounded-2xl border-2 ${
                            isSelected ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                          }`}
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: isSelected ? 0.15 : 0.08,
                            shadowRadius: 12,
                            elevation: isSelected ? 6 : 3,
                          }}
                        >
                          <View className="flex-row items-center flex-1">
                            {/* Supplement Icon */}
                            <View
                              className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                                isSelected ? 'bg-green-100' : 'bg-gray-100'
                              }`}
                            >
                              <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
                                <Text className="text-lg font-bold text-gray-700">💊</Text>
                              </View>
                            </View>

                            <View className="flex-1">
                              <Text
                                className={`text-lg font-bold mb-1 ${
                                  isSelected ? 'text-green-900' : 'text-gray-900'
                                }`}
                              >
                                {supplement.name}
                              </Text>
                              <Text
                                className={`text-sm ${
                                  isSelected ? 'text-green-600' : 'text-gray-600'
                                }`}
                              >
                                {supplement.default_dosage}
                              </Text>
                            </View>
                          </View>

                          {/* Selection Indicator */}
                          <View className="ml-4">
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
                                isSelected
                                  ? 'bg-green-500 border-green-500'
                                  : 'bg-transparent border-gray-300'
                              }`}
                            >
                              {isSelected && <Check size={18} color="white" strokeWidth={3} />}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Add New Supplement Card */}
                    <TouchableOpacity
                      onPress={() => setShowAddModal(true)}
                      className="flex-row items-center p-6 rounded-2xl"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderWidth: 2,
                        borderColor: '#E5E7EB',
                        borderStyle: 'dashed',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Plus size={24} color="#9CA3AF" />
                      <Text className="text-gray-600 text-lg ml-3">Add supplement</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Add Custom Supplement Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View
                className="bg-white rounded-t-3xl p-6 pb-8"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  elevation: 20,
                }}
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-bold text-gray-900">Add Supplement</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <View className="bg-gray-100 p-2 rounded-full">
                      <X size={20} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                </View>

                <View className="mb-5">
                  <Text className="text-base font-semibold text-gray-900 mb-3">Name</Text>
                  <View
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <TextInput
                      value={newSupplementName}
                      onChangeText={setNewSupplementName}
                      placeholder="e.g., Vitamin D3"
                      className="text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View className="mb-8">
                  <Text className="text-base font-semibold text-gray-900 mb-3">Dosage</Text>
                  <View
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <TextInput
                      value={newSupplementDose}
                      onChangeText={setNewSupplementDose}
                      placeholder="e.g., 1000 IU"
                      className="text-base text-gray-900"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={addCustomSupplement}
                  disabled={
                    !newSupplementName.trim() ||
                    !newSupplementDose.trim() ||
                    addSupplement.isPending
                  }
                  className="rounded-2xl p-4 items-center"
                  style={{
                    backgroundColor: '#EC4899',
                    opacity:
                      !newSupplementName.trim() ||
                      !newSupplementDose.trim() ||
                      addSupplement.isPending
                        ? 0.5
                        : 1,
                  }}
                >
                  <Text className="text-white font-bold text-lg">
                    {addSupplement.isPending ? 'Adding...' : 'Add Supplement'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SubPageLayout>
    </View>
  );
}
