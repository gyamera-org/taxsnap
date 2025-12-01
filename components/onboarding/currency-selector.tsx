import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { CurrencyConfig, CURRENCIES } from '@/context/currency-provider';

interface CurrencySelectorProps {
  selected: CurrencyConfig;
  onSelect: (currency: CurrencyConfig) => void;
}

export function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="flex-row flex-wrap justify-center">
        {CURRENCIES.map((currency) => {
          const isSelected = selected.code === currency.code;
          return (
            <Pressable
              key={currency.code}
              onPress={() => onSelect(currency)}
              className="m-1.5"
            >
              <View
                className={`w-24 h-24 rounded-2xl items-center justify-center border-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {isSelected && (
                  <View className="absolute top-2 right-2">
                    <Check size={14} color="#10B981" />
                  </View>
                )}
                <Text
                  className={`text-2xl font-bold mb-1 ${
                    isSelected ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {currency.symbol}
                </Text>
                <Text
                  className={`text-xs ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`}
                >
                  {currency.code}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
