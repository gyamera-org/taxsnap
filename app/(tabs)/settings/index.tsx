import { View, Pressable, Linking, Share, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { UserRound, FileText, Shield, UserMinus, LogOut, Star, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ConfirmationModal, Skeleton } from '@/components/ui';
import PageLayout from '@/components/layouts/page-layout';
import { useAuth } from '@/context/auth-provider';
import { toast } from 'sonner-native';
import { useAccount, useDeleteAccount } from '@/lib/hooks/use-accounts';

function SettingsPageSkeleton() {
  return (
    <>
      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <View key={index} className="p-4 border-b border-gray-100 last:border-b-0">
            <View className="flex-row items-center">
              <Skeleton width={20} height={20} className="mr-3" />
              <Skeleton width={120} height={16} />
            </View>
          </View>
        ))}
      </View>

      <View className="bg-white mx-4 rounded-2xl shadow mb-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} className="p-4 border-b border-gray-100 last:border-b-0">
            <View className="flex-row items-center">
              <Skeleton width={20} height={20} className="mr-3" />
              <Skeleton width={140} height={16} />
            </View>
          </View>
        ))}
      </View>

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

  const { isLoading } = useAccount();
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

  const handleShareApp = async () => {
    try {
      const shareMessage =
        `Hey, I just found this random app that shows me what all those weird ingredient names actually mean 🤔\n\n` +
        `Turns out half my "clean" products aren't that clean 😉\n\n` +
        `You need to start using this, check their app: https://apps.apple.com/app/id6747519576`;

      const result = await Share.share({
        message: shareMessage,
        title: 'What are you really putting on your skin?',
      });

      if (result.action === Share.sharedAction) {
        toast.success('Thanks for sharing BeautyScan! 💕');
      }
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share the app. Please try again.');
    }
  };

  return (
    <>
      <PageLayout title="Settings">
        {isLoading ? (
          <SettingsPageSkeleton />
        ) : (
          <>
            {/* Settings List */}
            <View className="bg-white mx-4 rounded-2xl shadow">
              <SettingsItem
                icon={UserRound}
                label="Personal details"
                onPress={() => router.push('/settings/personal-details')}
                isLast
              />
            </View>

            <View className="bg-white mx-4 rounded-2xl shadow mt-4">
              <SettingsItem
                icon={Star}
                label="Rate BeautyScan"
                onPress={() =>
                  Linking.openURL('https://apps.apple.com/app/id6747519576?action=write-review')
                }
              />
              <SettingsItem icon={Share2} label="Share App" onPress={handleShareApp} isLast />
            </View>

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
