import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import * as Clipboard from 'expo-clipboard';
import { FormPage } from '@/components/ui/form-page';
import { Gift, Copy, Share2, Users } from 'lucide-react-native';
import { APP_URLS } from '@/lib/config/urls';

const REFERRAL_CODE = 'DEBTFREE2024';
const REFERRAL_LINK = `${APP_URLS.baseUrl}/invite/${REFERRAL_CODE}`;

export default function ReferralScreen() {
  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    toast.success('Code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Debt Free and take control of your finances! Use my referral code ${REFERRAL_CODE} to get started. ${REFERRAL_LINK}`,
      });
    } catch (error) {
      // User cancelled
    }
  };

  return (
    <FormPage title="Refer & Earn">
      {/* Hero Section */}
      <View className="items-center py-6">
        <View className="w-20 h-20 rounded-3xl bg-emerald-500/20 items-center justify-center mb-4">
          <Gift size={40} color="#10B981" />
        </View>
        <Text className="text-white text-2xl font-bold text-center">Give 1 Month, Get 1 Month</Text>
        <Text className="text-gray-400 text-center mt-2 px-4">
          Share your referral code with friends. When they subscribe, you both get 1 month free!
        </Text>
      </View>

      {/* Referral Code Card */}
      <View className="rounded-2xl overflow-hidden mb-4">
        <LinearGradient
          colors={['#1a1a1f', '#141418']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
        <View className="p-5">
          <Text className="text-gray-500 text-xs uppercase tracking-wider mb-2">
            Your Referral Code
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-2xl font-bold tracking-widest">{REFERRAL_CODE}</Text>
            <Pressable
              onPress={handleCopyCode}
              className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center"
            >
              <Copy size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Share Button */}
      <Pressable onPress={handleShare} className="rounded-2xl overflow-hidden mb-6">
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="p-4 flex-row items-center justify-center">
          <Share2 size={20} color="#ffffff" />
          <Text className="text-white font-bold text-base ml-2">Share with Friends</Text>
        </View>
      </Pressable>

      {/* Stats */}
      <View className="rounded-2xl overflow-hidden">
        <LinearGradient
          colors={['#1a1a1f', '#141418']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
        <View className="p-5">
          <View className="flex-row items-center mb-4">
            <Users size={18} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2">Your Referrals</Text>
          </View>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">0</Text>
              <Text className="text-gray-500 text-sm">Friends Invited</Text>
            </View>
            <View className="flex-1">
              <Text className="text-emerald-400 text-2xl font-bold">0</Text>
              <Text className="text-gray-500 text-sm">Months Earned</Text>
            </View>
          </View>
        </View>
      </View>

      {/* How it works */}
      <View className="mt-6">
        <Text className="text-gray-500 text-xs uppercase tracking-wider mb-3">How it Works</Text>
        {[
          { step: '1', text: 'Share your unique referral code with friends' },
          { step: '2', text: 'They sign up and subscribe using your code' },
          { step: '3', text: 'You both get 1 month of premium free!' },
        ].map((item) => (
          <View key={item.step} className="flex-row items-center mb-3">
            <View className="w-7 h-7 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
              <Text className="text-emerald-400 font-bold text-sm">{item.step}</Text>
            </View>
            <Text className="text-gray-300 flex-1">{item.text}</Text>
          </View>
        ))}
      </View>
    </FormPage>
  );
}
