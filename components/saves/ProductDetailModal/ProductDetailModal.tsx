import { View, TouchableOpacity, Modal, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { ArrowLeft, Heart, Share2 } from 'lucide-react-native';
import { ScannedProductUI } from '@/lib/types/product';
import { ProductHero } from './ProductHero';
import { ProductStats } from './ProductStats';
import { IngredientsSection } from './IngredientsSection';
import { ProductLinks } from './ProductLinks';

interface ProductDetailModalProps {
  product: ScannedProductUI | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorite?: (productId: string) => void;
  modalHeight?: 'full' | '80%';
  onSaveScan?: () => void;
  isSavingScan?: boolean;
  isScanSaved?: boolean;
}

export function ProductDetailModal({
  product,
  visible,
  onClose,
  onToggleFavorite,
  modalHeight = 'full',
  onSaveScan,
  isSavingScan = false,
  isScanSaved = false,
}: ProductDetailModalProps) {
  if (!product) return null;

  const handleShare = async () => {
    try {
      const shareMessage =
        `Hey, I just found this random app that shows me the exact meaning of the jargons on beauty ingredients 🤔\n\n` +
        `Did you know "${product.name}" has a ${product.safetyScore}/100 safety score? I had no idea!\n\n` +
        `You need to start using this, it's actually mind-blowing 🤯\n\n` +
        `Check their app: https://apps.apple.com/app/id6747519576`;

      const result = await Share.share({
        message: shareMessage,
        title: `What's really in your beauty products?`,
      });

      if (result.action === Share.sharedAction) {
        // Successfully shared
      }
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share this product. Please try again.');
    }
  };

  if (modalHeight === '80%') {
    return (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="h-4/5 bg-slate-50 rounded-t-3xl">
            <SafeAreaView className="flex-1" edges={['bottom']}>
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 pt-6 pb-4 bg-slate-50 rounded-t-3xl">
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
                >
                  <ArrowLeft size={20} color="#000" />
                </TouchableOpacity>

                <View className="flex-1" />

                <TouchableOpacity
                  onPress={handleShare}
                  className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mr-2"
                >
                  <Share2 size={20} color="#000" />
                </TouchableOpacity>

                {onToggleFavorite && (
                  <TouchableOpacity
                    onPress={() => onToggleFavorite(product.id)}
                    className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
                  >
                    <Heart
                      size={20}
                      color="#000"
                      fill={product.isFavorite ? '#000' : 'transparent'}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <ProductHero product={product} />
                <ProductStats product={product} />
                <IngredientsSection product={product} />
                <ProductLinks product={product} />
              </ScrollView>

              {/* Save Button */}
              {onSaveScan && (
                <View className="px-6 pb-6">
                  <TouchableOpacity
                    onPress={onSaveScan}
                    disabled={isSavingScan || isScanSaved}
                    className={`w-full py-4 rounded-2xl items-center ${
                      isScanSaved ? 'bg-green-500' : 'bg-black'
                    }`}
                  >
                    <Text className="text-white text-lg font-bold">
                      {isScanSaved ? 'Saved!' : isSavingScan ? 'Saving...' : 'Save Scan'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    );
  }

  // Full height modal
  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
          >
            <ArrowLeft size={20} color="#000" />
          </TouchableOpacity>

          <View className="flex-1" />

          <TouchableOpacity
            onPress={handleShare}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mr-2"
          >
            <Share2 size={20} color="#000" />
          </TouchableOpacity>

          {onToggleFavorite && (
            <TouchableOpacity
              onPress={() => onToggleFavorite(product.id)}
              className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
            >
              <Heart size={20} color="#000" fill={product.isFavorite ? '#000' : 'transparent'} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProductHero product={product} />
          <ProductStats product={product} />
          <IngredientsSection product={product} />
          <ProductLinks product={product} />
        </ScrollView>

        {/* Save Button */}
        {onSaveScan && (
          <View className="px-6 pb-6">
            <TouchableOpacity
              onPress={onSaveScan}
              disabled={isSavingScan || isScanSaved}
              className={`w-full py-4 rounded-2xl items-center ${
                isScanSaved ? 'bg-green-500' : 'bg-black'
              }`}
            >
              <Text className="text-white text-lg font-bold">
                {isScanSaved ? 'Saved!' : isSavingScan ? 'Saving...' : 'Save Scan'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
