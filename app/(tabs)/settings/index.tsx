import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PageLayout, GlassCard } from '@/components/layouts';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/context/auth-provider';
import { APP_URLS } from '@/lib/config/urls';
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
      <Text className={`flex-1 text-base ${danger ? 'text-red-400' : 'text-white'}`}>{label}</Text>
      {showChevron && <ChevronRight size={20} color="#6B7280" />}
    </Pressable>
  );
}

function SettingsGroup({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <View className="mb-4">
      {title && (
        <Text className="text-gray-500 text-xs uppercase tracking-wider px-5 mb-2">{title}</Text>
      )}
      <GlassCard>
        <View className="-my-1">{children}</View>
      </GlassCard>
    </View>
  );
}

const DELETE_REASONS = [
  'No longer need the app',
  'Found a better alternative',
  'Too difficult to use',
  'Privacy concerns',
  'Other',
];

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAccount, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've been using Debt Free to crush my debt and it's actually working! If you're looking for a simple way to track your payments and stay motivated, check it out:\n\n${APP_URLS.appStore}`,
      });
    } catch {
      // User cancelled or error
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason) return;

    setIsDeleting(true);
    try {
      await deleteAccount(deleteReason, additionalComments);
      setShowDeleteModal(false);
    } catch {
      // Error is handled in auth provider
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteAlert = () => {
    setDeleteReason('');
    setAdditionalComments('');
    setShowDeleteModal(true);
  };

  return (
    <PageLayout title="Settings">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      >
        {/* Share with Friends Banner */}
        <Pressable onPress={handleShare} className="mx-4 mb-4">
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
                <Text className="text-white font-bold text-base">Share with Friends</Text>
                <Text className="text-emerald-100/80 text-sm">
                  Help a friend start their debt-free journey
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
          <SettingsItem
            icon={Bell}
            label="Notifications"
            onPress={() => router.push('/notifications')}
          />
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
            onPress={() => Linking.openURL(APP_URLS.terms)}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => Linking.openURL(APP_URLS.privacy)}
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

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onPress={() => !isDeleting && setShowDeleteModal(false)}
        >
          <Pressable
            className="w-full rounded-3xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }}
              />
            </BlurView>
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <View className="p-6">
              <Text className="text-xl font-semibold text-center mb-2 text-white">
                Delete Account
              </Text>
              <Text className="text-gray-400 text-center mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </Text>

              <Text className="text-white font-medium mb-2">
                Please tell us why you're leaving:
              </Text>
              {DELETE_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => setDeleteReason(reason)}
                  className={`flex-row items-center py-3 px-3 rounded-lg mb-2 ${
                    deleteReason === reason ? 'bg-red-500/20' : 'bg-white/5'
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      deleteReason === reason ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
                    {deleteReason === reason && (
                      <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </View>
                  <Text className="text-white">{reason}</Text>
                </Pressable>
              ))}

              <TextInput
                placeholder="Additional comments (optional)"
                placeholderTextColor="#6B7280"
                value={additionalComments}
                onChangeText={setAdditionalComments}
                multiline
                numberOfLines={3}
                className="bg-white/5 rounded-lg p-3 text-white mt-2 mb-4"
                style={{ textAlignVertical: 'top', minHeight: 80 }}
              />

              {isDeleting && (
                <View className="flex-row items-center justify-center mb-4">
                  <ActivityIndicator size="small" color="#EF4444" />
                  <Text className="text-gray-400 ml-2">Deleting your account...</Text>
                </View>
              )}

              <View className="gap-3">
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={!deleteReason || isDeleting}
                  className={`py-4 rounded-2xl ${
                    !deleteReason || isDeleting ? 'bg-red-500/40' : 'bg-red-500/80'
                  }`}
                >
                  <Text className="text-white text-center font-semibold">
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="py-4 rounded-2xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Text className="text-white text-center font-medium">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </PageLayout>
  );
}
