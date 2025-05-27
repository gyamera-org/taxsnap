import { View, Pressable, Text, Modal, TouchableOpacity } from 'react-native';
import { PRODUCT_TYPE } from '@/constants/product-type';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';

type ProductFilterProps = {
  selectedType: string | null;
  onSelectType: (type: string) => void;
};

export function ProductFilter({ selectedType, onSelectType }: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setIsOpen(true)} className="flex-row items-center ">
        <Text className="text-base text-gray-900 ml-2 capitalize">
          {selectedType === 'all' ? 'All Types' : selectedType?.replace('-', ' ')}
        </Text>
        <ChevronDown size={18} color="#374151" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-black/20"
        >
          <View className="mt-28 mx-5 bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={() => {
                onSelectType('all');
                setIsOpen(false);
              }}
              className="px-4 py-3 border-b border-gray-100"
            >
              <Text className="text-base">All Types</Text>
            </TouchableOpacity>

            {Object.values(PRODUCT_TYPE).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  onSelectType(type);
                  setIsOpen(false);
                }}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="text-base capitalize">{type.replace('-', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
