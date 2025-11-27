import { View, TextInput, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { BlurView } from 'expo-blur';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search debts...',
}: SearchBarProps) {
  return (
    <View className="mx-4 mb-4">
      <View className="h-12 rounded-2xl overflow-hidden bg-white/[0.03]">
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-2xl border border-white/10" />
        <View className="flex-row items-center flex-1 px-4">
          <Search size={18} color="#6B7280" />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            keyboardAppearance="dark"
            className="flex-1 text-white text-base ml-3"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText('')} hitSlop={8}>
              <X size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
