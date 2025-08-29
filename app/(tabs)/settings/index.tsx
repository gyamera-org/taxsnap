import { View, Pressable, Linking, Share, Alert, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  UserRound,
  FileText,
  Shield,
  UserMinus,
  LogOut,
  Star,
  Lightbulb,
  Bell,
  Target,
  Apple,
  Scale,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ConfirmationModal, Skeleton } from '@/components/ui';
import PageLayout from '@/components/layouts/page-layout';
import { useAuth } from '@/context/auth-provider';
import { toast } from 'sonner-native';
import { useAccount, useDeleteAccount } from '@/lib/hooks/use-accounts';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { SetupVerification } from '@/components/settings/setup-verification';

function SettingsPageSkeleton() {
  return (
    <>
      {/* User Profile Card Skeleton */}
      <View className="bg-white mx-4 rounded-2xl shadow mb-4 p-4">
        <View className="flex-row items-center">
          <Skeleton width={60} height={60} className="rounded-full mr-4" />
          <View className="flex-1">
            <Skeleton width={120} height={20} className="mb-2" />
            <Skeleton width={80} height={16} />
          </View>
        </View>
      </View>

      {/* Settings Items - Individual cards matching the layout */}
      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={140} height={16} />
          </View>
        </View>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={120} height={16} />
          </View>
        </View>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={140} height={16} />
          </View>
        </View>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={120} height={16} />
          </View>
        </View>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={180} height={16} />
          </View>
        </View>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        <View className="p-4">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton width={120} height={16} />
          </View>
        </View>
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
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
  const { signOut, user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: account, isLoading } = useAccount();
  const { mutate: deleteAccount } = useDeleteAccount();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete your account. Please try again or contact support.');
      setShowDeleteModal(false);
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
      <PageLayout title="Settings">
        {isLoading ? (
          <SettingsPageSkeleton />
        ) : (
          <>
            {/* User Profile Card */}
            <TouchableOpacity
              className="bg-white mx-4 rounded-2xl shadow mb-4 p-4"
              onPress={() => router.push('/settings/personal-details')}
            >
              <View className="flex-row items-center">
                <AvatarUpload size={60} showActions={false} />
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-semibold">{getUserDisplayData().name}</Text>
                  <Text className="text-gray-500">{getUserDisplayData().ageText}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Personal Settings */}
            <View className="bg-white mx-4 rounded-2xl shadow">
              {/* <SettingsItem
                icon={UserRound}
                label="Personal details"
                onPress={() => router.push('/settings/personal-details')}
              /> */}
              <SettingsItem
                icon={Bell}
                label="Reminder settings"
                onPress={() => router.push('/settings/reminder-settings')}
                isLast
              />
            </View>

            {/* Health & Fitness */}
            <View className="bg-white mx-4 rounded-2xl shadow mt-4">
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

            {/* App Feedback */}
            {/* <View className="bg-white mx-4 rounded-2xl shadow mt-4">
              <SettingsItem
                icon={Star}
                label="Rate BeautyScan"
                onPress={() =>
                  Linking.openURL('https://apps.apple.com/app/id6747519576?action=write-review')
                }
              />
              <SettingsItem
                icon={Lightbulb}
                label="Share BeautyScan"
                onPress={() =>
                  Share.share({
                    message:
                      "Hey, I just found this random app that shows me the exact meaning of the ingredients on beauty products. It's called BeautyScan and it's honestly pretty cool - you should check it out! https://apps.apple.com/app/id6747519576",
                    url: 'https://apps.apple.com/app/id6747519576',
                  })
                }
                isLast
              />
            </View> */}

            {/* Legal & Account */}
            <View className="bg-white mx-4 rounded-2xl shadow mt-4">
              <SettingsItem
                icon={FileText}
                label="Terms and Conditions"
                onPress={() => Linking.openURL('https://www.beautyscan.app/terms')}
              />
              <SettingsItem
                icon={Shield}
                label="Privacy Policy"
                onPress={() => Linking.openURL('https://www.beautyscan.app/privacy')}
              />
              <SettingsItem
                icon={UserMinus}
                label="Delete Account"
                onPress={() => setShowDeleteModal(true)}
                isLast
              />
            </View>

            {/* Logout */}
            <View className="bg-white mx-4 rounded-2xl shadow mt-4 mb-8">
              <SettingsItem icon={LogOut} label="Logout" isLast onPress={handleLogout} />
            </View>
          </>
        )}
      </PageLayout>

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete account?"
        message="Are you sure you want to permanently delete your account?"
        destructive
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
  return (
    <Pressable
      className={`flex-row items-center p-4 ${!isLast && 'border-b border-gray-100'}`}
      onPress={onPress}
    >
      <Icon size={20} color="black" />
      <Text className={`text-lg ${textClassName} ml-2`}>{label}</Text>
    </Pressable>
  );
}
