import { View, Text, Pressable, StyleSheet, Share, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { FormPage } from '@/components/ui/form-page';
import { Copy, Share2, Heart } from 'lucide-react-native';
import { APP_URLS } from '@/lib/config/urls';
import { useTranslation } from 'react-i18next';

const SHARE_LINK = APP_URLS.appStore;

export default function ReferralScreen() {
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(SHARE_LINK);
    toast.success(t('referral.codeCopied'));
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: t('referral.shareMessage', { link: SHARE_LINK }),
      });
    } catch (error) {
      // User cancelled
    }
  };

  return (
    <FormPage title={t('referral.title')}>
      {/* Hero Section with Background Image */}
      <View className="rounded-3xl overflow-hidden mb-6">
        <ImageBackground
          source={require('@/assets/images/referral-image.png')}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <LinearGradient
            colors={['rgba(13, 148, 136, 0.9)', 'rgba(15, 118, 110, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View className="p-6">
            <View className="items-center">
              <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
                <Heart size={32} color="#ffffff" />
              </View>
              <Text className="text-white text-2xl font-bold text-center">
                {t('referral.hero.title')}
              </Text>
              <Text className="text-white/90 text-center mt-2 text-base">
                {t('referral.hero.subtitle')}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Referral Code Card */}
      <View className="rounded-2xl overflow-hidden mb-4" style={styles.codeCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 rounded-2xl border-2 border-teal-200" />
        <View className="p-5">
          <Text className="text-teal-700 text-xs uppercase tracking-wider mb-2 font-semibold">
            {t('referral.yourCode')}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 text-base font-semibold flex-1 mr-3" numberOfLines={1}>{SHARE_LINK}</Text>
            <Pressable
              onPress={handleCopyLink}
              className="w-12 h-12 rounded-xl bg-teal-500 items-center justify-center"
            >
              <Copy size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Share Button */}
      <Pressable onPress={handleShare} className="rounded-2xl overflow-hidden mb-6">
        <LinearGradient
          colors={['#14B8A6', '#0D9488', '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="p-4 flex-row items-center justify-center">
          <Share2 size={20} color="#ffffff" />
          <Text className="text-white font-bold text-lg ml-2">{t('referral.shareButton')}</Text>
        </View>
      </Pressable>

      {/* How it works */}
      <View className="rounded-2xl overflow-hidden mb-6" style={styles.howItWorksCard}>
        <View className="absolute inset-0 bg-teal-50 rounded-2xl border border-teal-100" />
        <View className="p-5">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-teal-500 items-center justify-center mr-3">
              <Heart size={16} color="#ffffff" />
            </View>
            <Text className="text-teal-900 font-bold text-base">{t('referral.howToEarn')}</Text>
          </View>
          {[
            { step: '✦', text: t('referral.steps.step1') },
            { step: '✦', text: t('referral.steps.step2') },
          ].map((item, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-teal-600 font-bold text-lg mr-3 mt-0.5">{item.step}</Text>
              <Text className="text-gray-700 flex-1 text-base">{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Terms */}
      <View className="px-4">
        <Text className="text-gray-500 text-xs text-center leading-5">
          {t('referral.terms')}
        </Text>
      </View>
    </FormPage>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    minHeight: 200,
  },
  heroImageStyle: {
    borderRadius: 24,
  },
  codeCard: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  howItWorksCard: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
