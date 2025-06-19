import { View, Text } from 'react-native';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import { ScannedProductUI } from '@/lib/types/product';

interface IngredientCardProps {
  ingredient: ScannedProductUI['keyIngredients'][0];
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  const getIngredientConfig = (type: string | undefined) => {
    switch (type) {
      case 'beneficial':
        return {
          color: '#10B981',
          bgColor: '#10B98115',
          icon: CheckCircle,
        };
      case 'harmful':
        return {
          color: '#EF4444',
          bgColor: '#EF444415',
          icon: AlertTriangle,
        };
      default:
        return {
          color: '#6B7280',
          bgColor: '#6B728015',
          icon: Info,
        };
    }
  };

  const config = getIngredientConfig(ingredient?.type);
  const IconComponent = config.icon;

  return (
    <View
      className="p-4 rounded-2xl mb-3 border"
      style={{
        backgroundColor: config.bgColor,
        borderColor: `${config.color}30`,
      }}
    >
      <View className="flex-row items-start">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-1"
          style={{ backgroundColor: config.color }}
        >
          <IconComponent size={16} color="white" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-black mb-2">
            {ingredient?.name || 'Unknown Ingredient'}
          </Text>

          {/* Description */}
          {ingredient?.description && (
            <Text className="text-gray-700 text-sm leading-5 mb-2">{ingredient.description}</Text>
          )}

          {/* Effect */}
          {ingredient?.effect && (
            <View className="bg-white/50 rounded-lg p-3">
              <Text className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Effect on Hair/Skin
              </Text>
              <Text className="text-gray-800 text-sm leading-5">{ingredient.effect}</Text>
            </View>
          )}

          {/* Fallback for missing description and effect */}
          {!ingredient?.description && !ingredient?.effect && (
            <Text className="text-gray-500 text-sm italic">
              No description available for this ingredient
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
