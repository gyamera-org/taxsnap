import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PageLayout } from '@/components/layouts';
import { useCurrency, CURRENCIES, CurrencyConfig } from '@/context/currency-provider';

export default function CurrencyScreen() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = CURRENCIES.filter((curr) => {
    const query = searchQuery.toLowerCase();
    return (
      curr.name.toLowerCase().includes(query) ||
      curr.code.toLowerCase().includes(query)
    );
  });

  const handleCurrencySelect = async (selected: CurrencyConfig) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setCurrency(selected);
    router.back();
  };

  return (
    <PageLayout title="Currency" showBackButton>
      <View className="flex-1">
        {/* Search Bar */}
        <View className="mx-4 mt-2 mb-4 rounded-2xl overflow-hidden bg-white/[0.03]">
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View className="absolute inset-0 rounded-2xl border border-white/10" />
          <View className="flex-row items-center px-4 py-3">
            <Search size={18} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search currencies..."
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              className="flex-1 ml-3 text-white text-base"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color="#6B7280" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Currency List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {filteredCurrencies.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-gray-400 text-center">
                No currencies found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            filteredCurrencies.map((curr) => {
              const isSelected = currency.code === curr.code;
              return (
                <Pressable
                  key={curr.code}
                  onPress={() => handleCurrencySelect(curr)}
                  className={`flex-row items-center py-4 px-4 rounded-2xl mb-2 ${
                    isSelected ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/[0.03] border border-white/10'
                  }`}
                >
                  <Text className="text-3xl mr-4">{curr.flag}</Text>
                  <View className="flex-1">
                    <Text className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                      {curr.name}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-0.5">
                      {curr.code} • {curr.symbol}
                    </Text>
                  </View>
                  {isSelected && <Check size={22} color="#10B981" />}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </PageLayout>
  );
}
