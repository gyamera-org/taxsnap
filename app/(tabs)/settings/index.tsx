import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PageLayout, GlassCard } from '@/components/layouts';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { showConfirmAlert } from '@/lib/utils/alert';
import {
  User,
  Bell,
  Shield,
  FileText,
  MessageCircle,
  Star,
  LogOut,
  Trash2,
  ChevronRight,
  Gift,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingsItem({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
}: SettingsItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-4 px-1">
      <View
        className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
          danger ? 'bg-red-500/20' : 'bg-white/5'
        }`}
      >
        <Icon size={18} color={danger ? '#EF4444' : '#9CA3AF'} />
      </View>
      <Text
        className={`flex-1 text-base ${danger ? 'text-red-400' : 'text-white'}`}
      >
        {label}
      </Text>
      {showChevron && <ChevronRight size={20} color="#6B7280" />}
    </Pressable>
  );
}

function SettingsGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <View className="mb-4">
      {title && (
        <Text className="text-gray-500 text-xs uppercase tracking-wider px-5 mb-2">
          {title}
        </Text>
      )}
      <GlassCard>
        <View className="-my-1">{children}</View>
      </GlassCard>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    router.replace('/auth');
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    router.replace('/auth');
  };

  const showDeleteAlert = () => {
    showConfirmAlert({
      title: 'Delete Account',
      message: 'This action cannot be undone. All your data will be permanently deleted.',
      confirmText: 'Delete',
      onConfirm: handleDeleteAccount,
      destructive: true,
    });
  };

  return (
    <PageLayout title="Settings">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      >
        {/* Refer and Earn Banner */}
        <Pressable onPress={() => router.push('/referral')} className="mx-4 mb-4">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={['#064e3b', '#065f46', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="absolute inset-0 rounded-2xl border border-emerald-400/20" />
            <View className="p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center mr-4">
                <Gift size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Refer & Earn</Text>
                <Text className="text-emerald-100/80 text-sm">
                  Invite friends and get 1 month free
                </Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </Pressable>

        {/* Account Section */}
        <SettingsGroup title="Account">
          <SettingsItem icon={User} label="Profile" onPress={() => router.push('/profile')} />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem icon={Bell} label="Notifications" onPress={() => router.push('/notifications')} />
        </SettingsGroup>

        {/* Support Section */}
        <SettingsGroup title="Support">
          <SettingsItem
            icon={MessageCircle}
            label="Give Feedback"
            onPress={() => router.push('/feedback')}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem icon={Star} label="Rate the App" onPress={() => {}} />
        </SettingsGroup>

        {/* Legal Section */}
        <SettingsGroup title="Legal">
          <SettingsItem
            icon={FileText}
            label="Terms of Service"
            onPress={() => Linking.openURL('https://www.debt-free.app/terms')}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://www.debt-free.app/privacy')}
          />
        </SettingsGroup>

        {/* Account Actions */}
        <SettingsGroup>
          <SettingsItem
            icon={LogOut}
            label="Log Out"
            onPress={() => setShowLogoutModal(true)}
            showChevron={false}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Trash2}
            label="Delete Account"
            onPress={showDeleteAlert}
            showChevron={false}
            danger
          />
        </SettingsGroup>

        {/* App Version */}
        <View className="items-center mt-4">
          <Text className="text-gray-600 text-sm">Debt Free v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
      />
    </PageLayout>
  );
}
