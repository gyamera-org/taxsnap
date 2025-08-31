import { View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { Pill, Plus, X, CheckCircle } from 'lucide-react-native';
import { useAppNavigation } from '@/lib/hooks/use-navigation';

// Import real data hooks
import {
  useUserSupplements,
  useTodaysSupplements,
  useLogSupplement,
  useAddSupplement,
} from '@/lib/hooks/use-supplements';

export default function LogSupplementsScreen() {
  const [selectedSupplements, setSelectedSupplements] = useState<{ [key: string]: boolean }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplementName, setNewSupplementName] = useState('');
  const [newSupplementDose, setNewSupplementDose] = useState('');

  // Use real data
  const { data: userSupplements = [] } = useUserSupplements();
  const { data: todaysSupplements = [] } = useTodaysSupplements();
  const logSupplement = useLogSupplement();
  const addSupplement = useAddSupplement();
  const { goBack } = useAppNavigation();

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
    const today = new Date().toISOString().split('T')[0];

    // Log each selected supplement
    Object.entries(selectedSupplements).forEach(([supplementName, taken]) => {
      if (taken) {
        logSupplement.mutate({
          date: today,
          supplement_name: supplementName,
          taken: true,
        });
      }
    });

    goBack();
  };

  const isFormValid = Object.values(selectedSupplements).some((taken) => taken);

  return (
    <SubPageLayout
      title="Supplements"
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 py-8">
          {/* Today's Summary */}
          {isFormValid && (
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-3">
                <Pill size={16} color="#EC4899" />
                <Text className="text-lg font-semibold text-black ml-2">Today's Supplements</Text>
              </View>
              {Object.entries(selectedSupplements)
                .filter(([, taken]) => taken)
                .map(([supplementName]) => {
                  const supplement = userSupplements.find((s: any) => s.name === supplementName);
                  return (
                    <View
                      key={supplementName}
                      className="flex-row justify-between items-center py-2 border-b border-gray-50 last:border-b-0"
                    >
                      <Text className="text-gray-900 font-medium">{supplementName}</Text>
                      <Text className="text-gray-500 text-sm">{supplement?.default_dosage}</Text>
                    </View>
                  );
                })}
            </View>
          )}

          {/* Your Supplements */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-black">Your Supplements</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="flex-row items-center bg-pink-50 px-3 py-2 rounded-xl border border-pink-200"
              >
                <Plus size={16} color="#EC4899" />
                <Text className="text-pink-600 ml-1 font-medium text-sm">Add</Text>
              </TouchableOpacity>
            </View>

            {userSupplements.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center shadow-sm border border-gray-100">
                <Pill size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center font-medium">
                  No supplements added yet
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Tap "Add" to create your first supplement
                </Text>
              </View>
            ) : (
              userSupplements.map((supplement: any) => {
                const isSelected = selectedSupplements[supplement.name] || false;
                return (
                  <TouchableOpacity
                    key={supplement.id}
                    onPress={() => toggleSupplement(supplement.name)}
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-black">
                          {supplement.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">{supplement.default_dosage}</Text>
                      </View>

                      <View className="ml-4">
                        {isSelected ? (
                          <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
                            <CheckCircle size={20} color="white" />
                          </View>
                        ) : (
                          <View className="w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-300" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Custom Supplement Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">Add Supplement</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-base font-medium text-black mb-2">Supplement Name</Text>
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <TextInput
                  value={newSupplementName}
                  onChangeText={setNewSupplementName}
                  placeholder="e.g., Vitamin B12, Probiotics"
                  className="text-base text-black"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-2">Default Dose</Text>
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <TextInput
                  value={newSupplementDose}
                  onChangeText={setNewSupplementDose}
                  placeholder="e.g., 500mg, 1 tablet, 2 capsules"
                  className="text-base text-black"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <Button
              title="Add Supplement"
              onPress={addCustomSupplement}
              variant="primary"
              size="large"
              disabled={
                !newSupplementName.trim() || !newSupplementDose.trim() || addSupplement.isPending
              }
              loading={addSupplement.isPending}
            />
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
