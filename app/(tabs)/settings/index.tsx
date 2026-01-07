import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as Haptics from 'expo-haptics';
import { PageLayout, GlassCard } from '@/components/layouts';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/context/auth-provider';
import { useTheme } from '@/context/theme-provider';
import { APP_URLS } from '@/lib/config/urls';
import {
  User,
  Shield,
  FileText,
  MessageCircle,
  Star,
  LogOut,
  Trash2,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Calculator,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemedColors } from '@/lib/utils/theme';
import { useResponsive } from '@/lib/utils/responsive';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  colors: ReturnType<typeof useThemedColors>;
  rightElement?: React.ReactNode;
}

function SettingsItem({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
  colors,
  rightElement,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      className="flex-row items-center py-4 px-1"
    >
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: danger ? colors.dangerBackground : colors.iconBackground }}
      >
        <Icon size={18} color={danger ? colors.dangerText : colors.textSecondary} />
      </View>
      <Text
        className="flex-1 text-base"
        style={{ color: danger ? colors.dangerText : colors.text }}
      >
        {label}
      </Text>
      {rightElement}
      {showChevron && !rightElement && <ChevronRight size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

function SettingsGroup({
  children,
  title,
  colors,
}: {
  children: React.ReactNode;
  title?: string;
  colors: ReturnType<typeof useThemedColors>;
}) {
  return (
    <View className="mb-4">
      {title && (
        <Text
          className="text-xs uppercase tracking-wider px-5 mb-2"
          style={{ color: colors.textSecondary }}
        >
          {title}
        </Text>
      )}
      <GlassCard colors={colors}>
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
  const { isDark, setTheme } = useTheme();
  const colors = useThemedColors();
  const { isTablet, contentMaxWidth } = useResponsive();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
  };

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      Linking.openURL(APP_URLS.appStore);
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

  const toggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(isDark ? 'light' : 'dark');
  };

  // Content wrapper style for tablets
  const contentWrapperStyle = isTablet
    ? { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' as const }
    : {};

  return (
    <PageLayout title="Settings">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      >
        <View style={contentWrapperStyle}>
          {/* Account Section */}
          <SettingsGroup title="Account" colors={colors}>
            <SettingsItem
              icon={User}
              label="Profile"
              onPress={() => router.push('/profile')}
              colors={colors}
            />
            <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
            <SettingsItem
              icon={Calculator}
              label="Tax Profile"
              onPress={() => router.push('/tax-profile' as any)}
              colors={colors}
            />
            <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
            <SettingsItem
              icon={Bell}
              label="Notifications"
              onPress={() => router.push('/notifications')}
              colors={colors}
            />
          </SettingsGroup>

          {/* Appearance Section */}
          <SettingsGroup title="Appearance" colors={colors}>
            <SettingsItem
              icon={isDark ? Moon : Sun}
              label={isDark ? 'Dark Mode' : 'Light Mode'}
              onPress={toggleTheme}
              showChevron={false}
              colors={colors}
              rightElement={
                <View
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isDark ? colors.primary : colors.border,
                    justifyContent: 'center',
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.card,
                      alignSelf: isDark ? 'flex-end' : 'flex-start',
                    }}
                  />
                </View>
              }
            />
          </SettingsGroup>

          {/* Support Section */}
          <SettingsGroup title="Support" colors={colors}>
            <SettingsItem
              icon={MessageCircle}
              label="Give Feedback"
              onPress={() => router.push('/feedback')}
              colors={colors}
            />
            <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
            <SettingsItem
              icon={Star}
              label="Rate the App"
              onPress={handleRateApp}
              colors={colors}
            />
          </SettingsGroup>

          {/* Legal Section */}
          <SettingsGroup title="Legal" colors={colors}>
            <SettingsItem
              icon={FileText}
              label="Terms of Service"
              onPress={() => Linking.openURL(APP_URLS.terms)}
              colors={colors}
            />
            <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
            <SettingsItem
              icon={Shield}
              label="Privacy Policy"
              onPress={() => Linking.openURL(APP_URLS.privacy)}
              colors={colors}
            />
          </SettingsGroup>

          {/* Account Actions */}
          <SettingsGroup colors={colors}>
            <SettingsItem
              icon={LogOut}
              label="Log Out"
              onPress={() => setShowLogoutModal(true)}
              showChevron={false}
              colors={colors}
            />
            <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
            <SettingsItem
              icon={Trash2}
              label="Delete Account"
              onPress={showDeleteAlert}
              showChevron={false}
              danger
              colors={colors}
            />
          </SettingsGroup>

          {/* App Version */}
          <View className="items-center mt-4">
            <Text className="text-sm" style={{ color: colors.textMuted }}>
              TaxSnap v1.0.0
            </Text>
          </View>
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
          style={{ backgroundColor: colors.modalOverlay }}
          onPress={() => !isDeleting && setShowDeleteModal(false)}
        >
          <Pressable
            className="w-full rounded-3xl overflow-hidden"
            style={{ backgroundColor: colors.modalBackground }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6">
              <Text
                className="text-xl font-semibold text-center mb-2"
                style={{ color: colors.text }}
              >
                Delete Account
              </Text>
              <Text className="text-center mb-4" style={{ color: colors.textSecondary }}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>

              <Text className="font-medium mb-2" style={{ color: colors.text }}>
                Please tell us why you're leaving:
              </Text>
              {DELETE_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => setDeleteReason(reason)}
                  className="flex-row items-center py-3 px-3 rounded-lg mb-2"
                  style={{
                    backgroundColor:
                      deleteReason === reason ? colors.dangerBackground : colors.inputBackground,
                  }}
                >
                  <View
                    className="w-5 h-5 rounded-full border-2 mr-3 items-center justify-center"
                    style={{
                      borderColor: deleteReason === reason ? colors.dangerText : colors.textMuted,
                    }}
                  >
                    {deleteReason === reason && (
                      <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </View>
                  <Text style={{ color: colors.text }}>{reason}</Text>
                </Pressable>
              ))}

              <TextInput
                placeholder="Additional comments (optional)"
                placeholderTextColor={colors.inputPlaceholder}
                value={additionalComments}
                onChangeText={setAdditionalComments}
                multiline
                numberOfLines={3}
                className="rounded-lg p-3 mt-2 mb-4"
                style={{
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  textAlignVertical: 'top',
                  minHeight: 80,
                }}
              />

              {isDeleting && (
                <View className="flex-row items-center justify-center mb-4">
                  <ActivityIndicator size="small" color={colors.dangerText} />
                  <Text className="ml-2" style={{ color: colors.textSecondary }}>
                    Deleting your account...
                  </Text>
                </View>
              )}

              <View className="gap-3">
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={!deleteReason || isDeleting}
                  className="py-4 rounded-2xl"
                  style={{
                    backgroundColor: !deleteReason || isDeleting ? colors.textMuted : colors.danger,
                  }}
                >
                  <Text className="text-white text-center font-semibold">
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="py-4 rounded-2xl"
                  style={{ backgroundColor: colors.inputBackground }}
                >
                  <Text className="text-center font-medium" style={{ color: colors.text }}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </PageLayout>
  );
}
