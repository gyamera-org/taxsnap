import { useState } from 'react';
import { View, Pressable, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import SettingsDetailItem from '@/components/settings-detail-item';
import { cn } from '@/lib/utils';
import { SubPageLayout } from '@/components/layouts';

const hairGoalOptions = [
  'Longer',
  'Healthier',
  'Defined curls',
  'Protective styling',
  'Edge growth',
  'All of the above',
];

const porosityOptions = ['High', 'Mid', 'Low'];
const routineOptions = ['Daily', 'Weekly', 'During protective style'];
const lengthOptions = Array.from({ length: 40 }, (_, i) => `${i + 1} inches`);
const cmOptions = Array.from({ length: 60 }, (_, i) => `${i + 30} cm`);

export default function AdjustHairGoalsScreen() {
  const [details, setDetails] = useState({
    hairLength: '12 inches',
    routine: 'Weekly',
    hairGoal: 'Longer',
    porosity: 'Mid',
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [showLengthModal, setShowLengthModal] = useState(false);
  const [useMetric, setUseMetric] = useState(false);

  const handleEdit = (field: string, value: string | Date) => {
    if (field === 'hairGoal') {
      setDropdownOptions(hairGoalOptions);
      setEditingField(field);
      setShowDropdown(true);
    } else if (field === 'porosity') {
      setDropdownOptions(porosityOptions);
      setEditingField(field);
      setShowDropdown(true);
    } else if (field === 'routine') {
      setDropdownOptions(routineOptions);
      setEditingField(field);
      setShowDropdown(true);
    } else if (field === 'hairLength') {
      setEditingField(field);
      setShowLengthModal(true);
    } else {
      setEditingField(field);
      setTempValue(typeof value === 'string' ? value : value.toLocaleDateString());
    }
  };

  const handleSave = (field: string) => {
    if (field === 'dateOfBirth') return;

    setDetails((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
  };

  const handleSelectDropdown = (value: string) => {
    if (editingField) {
      setDetails((prev) => ({ ...prev, [editingField]: value }));
    }
    setEditingField(null);
    setShowDropdown(false);
  };

  const handleSelectLength = (value: string) => {
    setDetails((prev) => ({ ...prev, hairLength: value }));
    setEditingField(null);
    setShowLengthModal(false);
  };

  return (
    <SubPageLayout title="Adjust Hair Goals">
      <View className="bg-white mx-4 p-4 rounded-2xl shadow flex flex-col gap-4">
        {Object.entries(details).map(([field, value], index) => (
          <SettingsDetailItem
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            value={value}
            isEditing={editingField === field}
            tempValue={tempValue}
            onEdit={() => handleEdit(field, value)}
            onSave={() => handleSave(field)}
            onChangeText={setTempValue}
            isLast={index === Object.entries(details).length - 1}
          />
        ))}
      </View>

      <Modal visible={showDropdown} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full rounded-xl max-h-[300px]">
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectDropdown(item)}
                  className="px-4 py-4 border-b border-gray-100"
                >
                  <Text className="text-base text-black">{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showLengthModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-4 rounded-t-3xl">
            <View className="flex-row justify-center items-center mb-4">
              <Pressable
                className={cn(
                  'mr-4',
                  !useMetric && 'text-black font-semibold',
                  useMetric && 'text-gray-400'
                )}
                onPress={() => setUseMetric(false)}
              >
                <Text className={cn('text-base', !useMetric && 'font-bold text-black')}>
                  Imperial
                </Text>
              </Pressable>
              <Pressable onPress={() => setUseMetric(true)}>
                <Text className={cn('text-base', useMetric && 'font-bold text-black')}>Metric</Text>
              </Pressable>
            </View>
            <FlatList
              data={useMetric ? cmOptions : lengthOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectLength(item)}
                  className={cn('py-3 items-center', useMetric && 'text-lg')}
                >
                  <Text className="text-black text-lg">{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              style={{ maxHeight: 300 }}
            />
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
