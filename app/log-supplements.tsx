import { View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import { Pill, Plus, Minus, Search, X } from 'lucide-react-native';

export default function LogSupplementsScreen() {
  const [selectedSupplements, setSelectedSupplements] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplementName, setNewSupplementName] = useState('');
  const [newSupplementDose, setNewSupplementDose] = useState('');
  const [userSupplements, setUserSupplements] = useState([
    { id: 'vitamin_d', name: 'Vitamin D', defaultDose: '1000 IU', color: '#EC4899' },
    { id: 'omega_3', name: 'Omega-3', defaultDose: '1000 mg', color: '#EC4899' },
    { id: 'multivitamin', name: 'Multivitamin', defaultDose: '1 tablet', color: '#EC4899' },
  ]);

  const addCustomSupplement = () => {
    if (newSupplementName.trim() && newSupplementDose.trim()) {
      const newId = newSupplementName.toLowerCase().replace(/\s+/g, '_');
      const newSupplement = {
        id: newId,
        name: newSupplementName.trim(),
        defaultDose: newSupplementDose.trim(),
        color: '#EC4899',
      };

      setUserSupplements((prev) => [...prev, newSupplement]);
      setNewSupplementName('');
      setNewSupplementDose('');
      setShowAddModal(false);
    }
  };

  const updateSupplementCount = (supplementId: string, change: number) => {
    setSelectedSupplements((prev) => {
      const current = prev[supplementId] || 0;
      const newCount = Math.max(0, current + change);
      if (newCount === 0) {
        const { [supplementId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [supplementId]: newCount };
    });
  };

  const handleSave = () => {
    const supplements = Object.entries(selectedSupplements).map(([id, count]) => {
      const supplement = userSupplements.find((s) => s.id === id);
      return { id, name: supplement?.name, count, defaultDose: supplement?.defaultDose };
    });

    if (supplements.length > 0) {
      router.back();
    }
  };

  return (
    <SubPageLayout
      title="Supplements"
      rightElement={
        <Button
          title="Log"
          onPress={handleSave}
          variant="primary"
          size="small"
          disabled={Object.keys(selectedSupplements).length === 0}
        />
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 py-8">
          {/* Search */}
          <View className="mb-6">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center">
              <Search size={20} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search supplements..."
                className="flex-1 ml-3 text-base text-black"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Today's Summary */}
          {Object.keys(selectedSupplements).length > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-3">
                <Pill size={16} color="#EC4899" />
                <Text className="text-lg font-semibold text-black ml-2">Today's Supplements</Text>
              </View>
              {Object.entries(selectedSupplements).map(([id, count]) => {
                const supplement = userSupplements.find((s) => s.id === id);
                return (
                  <View
                    key={id}
                    className="flex-row justify-between items-center py-2 border-b border-gray-50 last:border-b-0"
                  >
                    <Text className="text-gray-900 font-medium">
                      {supplement?.name} × {count}
                    </Text>
                    <Text className="text-gray-500 text-sm">{supplement?.defaultDose}</Text>
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
              userSupplements
                .filter((supplement) =>
                  supplement.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((supplement) => {
                  const count = selectedSupplements[supplement.id] || 0;
                  return (
                    <View
                      key={supplement.id}
                      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-black">
                            {supplement.name}
                          </Text>
                          <Text className="text-gray-500 text-sm">{supplement.defaultDose}</Text>
                        </View>

                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => updateSupplementCount(supplement.id, -1)}
                            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                            disabled={count === 0}
                          >
                            <Minus size={16} color={count === 0 ? '#9CA3AF' : '#374151'} />
                          </TouchableOpacity>

                          <Text className="mx-4 text-xl font-bold text-black min-w-[40px] text-center">
                            {count}
                          </Text>

                          <TouchableOpacity
                            onPress={() => updateSupplementCount(supplement.id, 1)}
                            className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center border border-pink-200"
                          >
                            <Plus size={16} color="#EC4899" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
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
              disabled={!newSupplementName.trim() || !newSupplementDose.trim()}
            />
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
