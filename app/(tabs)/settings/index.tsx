import { View, Pressable, Linking, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  FileText,
  Shield,
  UserMinus,
  LogOut,
  Target,
  Apple,
  Scale,
  MessageCircle,
  Bug,
  Star,
  Crown,
  Sparkles,
  Brain,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Skeleton } from '@/components/ui';
import { DeleteAccountFeedbackModal } from '@/components/modals/delete-account-feedback-modal';
import PageLayout from '@/components/layouts/page-layout';
import { useAuth } from '@/context/auth-provider';
import { toast } from 'sonner-native';
import { useAccount, useDeleteAccount } from '@/lib/hooks/use-accounts';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { useAvatar } from '@/lib/hooks/use-avatar';
import * as StoreReview from 'expo-store-review';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { supabase } from '@/lib/supabase/client';
import { ThemeSelector } from '@/components/settings/theme-selector';
import { useTheme } from '@/context/theme-provider';
import { PremiumGradientBackground } from '@/components/ui/animated-gradient';

function SettingsPageSkeleton() {
  const { isDark } = useTheme();
  
  return (
    <>
      {/* User Profile Card Skeleton */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4 p-4`}>
        <View className="flex-row items-center">
          <Skeleton width={60} height={60} className="rounded-full mr-4" />
          <View className="flex-1">
            <Skeleton width={120} height={20} className="mb-2" />
            <Skeleton width={80} height={16} />
          </View>
        </View>
      </View>

      {/* Settings Items - Individual cards matching the layout */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={140} height={16} />
          </View>
        </View>
      </View>

      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={120} height={16} />
          </View>
        </View>
      </View>

      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={140} height={16} />
          </View>
        </View>
      </View>

      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={120} height={16} />
          </View>
        </View>
      </View>

      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={180} height={16} />
          </View>
        </View>
      </View>

      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={120} height={16} />
          </View>
        </View>
      </View>

      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 rounded-2xl shadow mb-4`}>
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={140} height={16} />
          </View>
        </View>
      </View>

      {/* Logout section */}
      <View className="bg-white mx-4 rounded-2xl shadow mb-8">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={80} height={16} />
          </View>
        </View>
      </View>
    </>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const { isDark } = useTheme();

  const { data: account, isLoading } = useAccount();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const { isSubscribed, isInGracePeriod } = useRevenueCat();
  const { data: avatarUrl } = useAvatar();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleDeleteAccount = (reason: string, comments?: string) => {
    try {
      deleteAccount({ reason, additional_comments: comments });
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete your account. Please try again or contact support.');
      setShowDeleteModal(false);
    }
  };

  const handleRateUs = async () => {
    try {
      // Check if the device supports in-app reviews
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        // Request in-app review
        await StoreReview.requestReview();
      } else {
        // Fallback to opening App Store
        await Linking.openURL('https://apps.apple.com/app/id6751772486?action=write-review');
      }
    } catch (error) {
      console.error('Failed to request review:', error);
      // Fallback to App Store if in-app review fails
      try {
        await Linking.openURL('https://apps.apple.com/app/id6751772486?action=write-review');
      } catch (linkingError) {
        toast.error('Unable to open rating page');
      }
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    try {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);

      // Check if date is valid
      if (isNaN(birthDate.getTime())) return null;

      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    } catch (error) {
      console.warn('Error calculating age:', error);
      return null;
    }
  };

  // Get user display data with fallbacks
  const getUserDisplayData = () => {
    const name = account?.name || 'User';

    let ageText = 'Age not set';
    const userAge = account?.date_of_birth ? calculateAge(account.date_of_birth) : null;

    if (userAge !== null && userAge >= 0) {
      ageText = `${userAge} years old`;
    }

    return { name, ageText };
  };

  return (
    <>
      <PageLayout title="My Profile">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            maxWidth: isTablet ? 600 : '100%',
            marginHorizontal: 'auto',
            width: '100%',
          }}
        >
          {isLoading ? (
            <SettingsPageSkeleton />
          ) : (
            <>
              {/* User Profile Card */}
              <TouchableOpacity
                className={`${isDark ? 'bg-card-dark' : 'bg-white'} ${isTablet ? 'mx-8' : 'mx-4'} rounded-2xl shadow mb-4 ${
                  isTablet ? 'p-6' : 'p-4'
                }`}
                onPress={() => router.push('/settings/personal-details')}
              >
                <View className="flex-row items-center">
                  <AvatarUpload size={60} showActions={true} showIcon={!avatarUrl} />
                  <View className="ml-4 flex-1">
                    <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{getUserDisplayData().name}</Text>
                    <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{getUserDisplayData().ageText}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Subscription Section */}
              {!isSubscribed && !isInGracePeriod && (
                <PremiumGradientBackground 
                  className={`${isTablet ? 'mx-8' : 'mx-4'} rounded-2xl shadow mb-4 overflow-hidden`}
                >
                  <TouchableOpacity
                    className={`${isTablet ? 'p-6' : 'p-4'}`}
                    style={{
                      shadowColor: '#EC4899',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                    onPress={() => router.push('/paywall')}
                  >
                    <View className="flex-row items-center">
                      <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mr-4 backdrop-blur-sm">
                        <Crown size={26} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-xl font-bold mb-1">Upgrade to Premium</Text>
                        <Text className="text-white/90 text-sm">Unlock all features & get personalized insights</Text>
                      </View>
                      <View className="items-center">
                        <Sparkles size={24} color="white" className="mb-1" />
                        <View className="w-2 h-2 bg-white/60 rounded-full" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </PremiumGradientBackground>
              )}

              {/* Show subscription status for premium users */}
              {(isSubscribed || isInGracePeriod) && (
                <View
                  className={`${
                    isDark 
                      ? 'bg-emerald-900/30 border border-emerald-700/50' 
                      : 'bg-emerald-50 border border-emerald-200'
                  } ${
                    isTablet ? 'mx-8' : 'mx-4'
                  } rounded-2xl mb-4 ${isTablet ? 'p-6' : 'p-4'}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
                      isDark ? 'bg-emerald-800/50' : 'bg-emerald-100'
                    }`}>
                      <Crown size={26} color={isDark ? '#10B981' : '#059669'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-xl font-bold mb-1 ${
                        isDark ? 'text-emerald-200' : 'text-emerald-800'
                      }`}>Premium Active</Text>
                      <Text className={`text-sm ${
                        isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}>
                        {isInGracePeriod
                          ? 'Grace period - enjoy all features'
                          : 'All features unlocked'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Personal Settings */}
              {/* <View className="bg-white mx-4 rounded-2xl shadow"> */}
              {/* <SettingsItem
                icon={UserRound}
                label="Personal details"
                onPress={() => router.push('/settings/personal-details')}
              /> */}
              {/* <SettingsItem
                icon={Bell}
                label="Reminder settings"
                onPress={() => router.push('/settings/reminder-settings')}
                isLast
              /> */}
              {/* </View> */}

              {/* Beauty Section */}
              {/* <View className="mx-4 mt-4">
                <Text className="text-lg font-semibold text-black mb-3">Beauty</Text>
              </View> */}
              {/* <View className="bg-white mx-4 rounded-2xl shadow">
                <SettingsItem
                  icon={Sparkles}
                  label="Skincare Products"
                  onPress={() => router.push('/settings/skincare-products')}
                />
                <SettingsItem
                  icon={Scissors}
                  label="Haircare Products"
                  onPress={() => router.push('/settings/haircare-products')}
                />
                <SettingsItem
                  icon={Pill}
                  label="Supplements"
                  onPress={() => router.push('/settings/supplements')}
                  isLast
                />
              </View> */}

              {/* Theme Selector */}
              <ThemeSelector />

              {/* Wellness Section */}
              {/* <View className="mx-4 mt-3">
                <Text className="text-lg font-semibold text-black mb-3">Wellness</Text>
              </View> */}
              <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} ${isTablet ? 'mx-8' : 'mx-4'} rounded-2xl shadow mb-4`}>
                <SettingsItem
                  icon={Target}
                  label="Fitness goals"
                  onPress={() => router.push('/settings/fitness-goals')}
                />
                <SettingsItem
                  icon={Apple}
                  label="Nutrition goals"
                  onPress={() => router.push('/settings/nutrition-goals')}
                />
                <SettingsItem
                  icon={Scale}
                  label="Weight tracking"
                  onPress={() => router.push('/settings/weight')}
                  isLast
                />
              </View>

              {/* Support Section */}
              <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} ${isTablet ? 'mx-8' : 'mx-4'} rounded-2xl shadow mb-4`}>
                <SettingsItem
                  icon={Brain}
                  label="How Luna works"
                  onPress={() => router.push('/settings/medical-sources')}
                />
                <SettingsItem
                  icon={MessageCircle}
                  label="Contact"
                  onPress={() =>
                    Linking.openURL('mailto:team@lunasync.app?subject=Support Request')
                  }
                />
                <SettingsItem
                  icon={Bug}
                  label="Report"
                  onPress={() => router.push('/settings/report')}
                />
                <SettingsItem icon={Star} label="Rate Us" onPress={handleRateUs} isLast />
              </View>

              {/* App Feedback */}
              {/* <View className="bg-white mx-4 rounded-2xl shadow mt-4">
              <SettingsItem
                icon={Star}
                label="Rate LunaSync"
                onPress={() =>
                  Linking.openURL('https://apps.apple.com/app/id6747519576?action=write-review')
                }
              />
              <SettingsItem
                icon={Lightbulb}
                label="Share LunaSync"
                onPress={() =>
                  Share.share({
                    message:
                      "Hey, I just found this random app that shows me the exact meaning of the ingredients on beauty products. It's called LunaSync and it's honestly pretty cool - you should check it out! https://apps.apple.com/app/id6747519576",
                    url: 'https://apps.apple.com/app/id6747519576',
                  })
                }
                isLast
              />
            </View> */}

              {/* Legal & Account Section */}
              {/* <View className="mx-4 mt-3 mb-8">
                <Text className="text-lg font-semibold text-black mb-3">Legal & Account</Text>
              </View> */}
              <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} ${isTablet ? 'mx-8' : 'mx-4'} rounded-2xl shadow`}>
                <SettingsItem
                  icon={FileText}
                  label="Terms"
                  onPress={() => Linking.openURL('https://www.lunasync.app/terms')}
                />
                <SettingsItem
                  icon={Shield}
                  label="Privacy Policy"
                  onPress={() => Linking.openURL('https://www.lunasync.app/privacy')}
                />
                <SettingsItem
                  icon={UserMinus}
                  label="Delete Account"
                  onPress={() => setShowDeleteModal(true)}
                  isLast
                />
                <SettingsItem icon={LogOut} label="Logout" isLast onPress={handleLogout} />
              </View>
            </>
          )}
        </ScrollView>
      </PageLayout>

      <DeleteAccountFeedbackModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  isLast,
  onPress,
  textClassName = '',
}: {
  icon: React.ElementType;
  label: string;
  isLast?: boolean;
  onPress?: () => void;
  textClassName?: string;
}) {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const { isDark } = useTheme();

  return (
    <Pressable
      className={`flex-row items-center ${isTablet ? 'p-6' : 'p-4'} ${
        !isLast && `border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`
      }`}
      onPress={onPress}
    >
      <Icon size={isTablet ? 24 : 20} color={isDark ? '#F9FAFB' : 'black'} />
      <Text className={`${isTablet ? 'text-xl' : 'text-lg'} ${isDark ? 'text-white' : 'text-black'} ${textClassName} ml-2`}>{label}</Text>
    </Pressable>
  );
}
