import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';

import { Plus, X, Package, Trash2, Edit3 } from 'lucide-react-native';
import {
  useUserSupplements,
  useAddSupplement,
  useDeleteSupplement,
  useUpdateSupplement,
} from '@/lib/hooks/use-supplements';

interface SupplementForm {
  name: string;
  dosage: string;
  frequency: 'Daily' | '3x/week' | '2x/week' | 'Weekly';
  importance: 'high' | 'medium' | 'low';
}

export default function SupplementsScreen() {
  const router = useRouter();
  const { data: userSupplements = [] } = useUserSupplements();
  const addSupplement = useAddSupplement();
  const deleteSupplement = useDeleteSupplement();
  const updateSupplement = useUpdateSupplement();

  const handleGoBack = () => {
    router.push('/(tabs)/settings');
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<any>(null);
  const [supplementForm, setSupplementForm] = useState<SupplementForm>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    importance: 'medium',
  });

  const frequencies = ['Daily', '3x/week', '2x/week', 'Weekly'] as const;
  const importanceLevels = [
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'low', label: 'Low', color: '#10B981' },
  ] as const;

  const resetForm = () => {
    setSupplementForm({
      name: '',
      dosage: '',
      frequency: 'Daily',
      importance: 'medium',
    });
    setEditingSupplement(null);
  };

  const openEditModal = (supplement: any) => {
    setSupplementForm({
      name: supplement.name,
      dosage: supplement.default_dosage || '',
      frequency: supplement.frequency,
      importance: supplement.importance,
    });
    setEditingSupplement(supplement);
    setShowAddModal(true);
  };

  const handleSaveSupplement = () => {
    if (!supplementForm.name.trim() || !supplementForm.dosage.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const supplementData = {
      name: supplementForm.name.trim(),
      default_dosage: supplementForm.dosage.trim(),
      frequency: supplementForm.frequency,
      importance: supplementForm.importance,
      days_of_week: ['Daily'],
      is_active: true,
    };

    if (editingSupplement) {
      updateSupplement.mutate(
        { id: editingSupplement.id, ...supplementData },
        {
          onSuccess: () => {
            toast.success('Supplement updated!');
            setShowAddModal(false);
            resetForm();
          },
        }
      );
    } else {
      addSupplement.mutate(supplementData, {
        onSuccess: () => {
          toast.success('Supplement added!');
          setShowAddModal(false);
          resetForm();
        },
      });
    }
  };

  const handleDeleteSupplement = (supplementId: string) => {
    deleteSupplement.mutate(supplementId, {
      onSuccess: () => {
        toast.success('Supplement removed');
      },
    });
  };

  const getImportanceColor = (importance: string) => {
    const level = importanceLevels.find((l) => l.value === importance);
    return level?.color || '#10B981';
  };

  return (
    <SubPageLayout
      title="Supplements"
      onBack={handleGoBack}
      rightElement={
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="w-10 h-10 items-center justify-center bg-green-100 rounded-full"
        >
          <Plus size={20} color="#10B981" />
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {userSupplements.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 border border-gray-200">
              <View className="items-center">
                <Package size={40} color="#9CA3AF" />
                <Text className="text-gray-500 text-center mt-2">No supplements yet</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Tap + to add your first supplement
                </Text>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {userSupplements.map((supplement) => (
                <View
                  key={supplement.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg font-semibold text-black mr-2">
                          {supplement.name}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${getImportanceColor(supplement.importance)}15`,
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: getImportanceColor(supplement.importance) }}
                          >
                            {supplement.importance.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-gray-600 text-sm mb-1">
                        {supplement.default_dosage}
                      </Text>

                      <Text className="text-gray-500 text-sm">{supplement.frequency}</Text>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => openEditModal(supplement)}
                        className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center"
                      >
                        <Edit3 size={14} color="#3B82F6" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteSupplement(supplement.id)}
                        className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Supplement Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">
                {editingSupplement ? 'Edit Supplement' : 'Add Supplement'}
              </Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="gap-6">
              {/* Name */}
              <View>
                <Text className="text-base font-medium text-black mb-2">Supplement Name *</Text>
                <TextInput
                  className="bg-white rounded-xl p-4 border border-gray-200 text-base"
                  placeholder="e.g., Vitamin D3, Magnesium"
                  value={supplementForm.name}
                  onChangeText={(text) => setSupplementForm((prev) => ({ ...prev, name: text }))}
                />
              </View>

              {/* Dosage */}
              <View>
                <Text className="text-base font-medium text-black mb-2">Dosage *</Text>
                <TextInput
                  className="bg-white rounded-xl p-4 border border-gray-200 text-base"
                  placeholder="e.g., 1000mg, 2 capsules"
                  value={supplementForm.dosage}
                  onChangeText={(text) => setSupplementForm((prev) => ({ ...prev, dosage: text }))}
                />
              </View>

              {/* Frequency */}
              <View>
                <Text className="text-base font-medium text-black mb-3">Frequency</Text>
                <View className="flex-row flex-wrap gap-2">
                  {frequencies.map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => setSupplementForm((prev) => ({ ...prev, frequency: freq }))}
                      className={`px-4 py-3 rounded-xl border ${
                        supplementForm.frequency === freq
                          ? 'bg-green-100 border-green-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          supplementForm.frequency === freq
                            ? 'text-green-700 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {freq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Importance */}
              <View>
                <Text className="text-base font-medium text-black mb-3">Importance</Text>
                <View className="flex-row gap-2">
                  {importanceLevels.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      onPress={() =>
                        setSupplementForm((prev) => ({ ...prev, importance: level.value }))
                      }
                      className={`flex-1 px-4 py-3 rounded-xl border ${
                        supplementForm.importance === level.value
                          ? 'border-2'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{
                        borderColor:
                          supplementForm.importance === level.value ? level.color : '#E5E7EB',
                        backgroundColor:
                          supplementForm.importance === level.value
                            ? `${level.color}15`
                            : '#FFFFFF',
                      }}
                    >
                      <Text
                        className={`text-sm text-center font-medium`}
                        style={{
                          color:
                            supplementForm.importance === level.value ? level.color : '#6B7280',
                        }}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Button
              title={editingSupplement ? 'Update Supplement' : 'Add Supplement'}
              onPress={handleSaveSupplement}
              variant="primary"
              className="mt-8"
              disabled={
                !supplementForm.name.trim() ||
                !supplementForm.dosage.trim() ||
                addSupplement.isPending ||
                updateSupplement.isPending
              }
              loading={addSupplement.isPending || updateSupplement.isPending}
            />
          </ScrollView>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
