import { View, TextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useState } from 'react';

type ProductSearchProps = {
  onSearch: (text: string) => void;
};

export function ProductSearch({ onSearch }: ProductSearchProps) {
  const [searchText, setSearchText] = useState('');

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <View className="flex-row items-center bg-white px-2 py-3 rounded-xl">
      <Search size={20} color="#6B7280" />
      <TextInput
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          onSearch(text);
        }}
        placeholder="Search products..."
        className="flex-1 ml-3 text-base"
        placeholderTextColor="#6B7280"
      />
      {searchText.length > 0 && (
        <Pressable onPress={handleClear}>
          <X size={20} color="#6B7280" />
        </Pressable>
      )}
    </View>
  );
}
