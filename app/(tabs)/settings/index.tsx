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
  ImageBackground,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { PageLayout, GlassCard } from '@/components/layouts';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/context/auth-provider';
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
  Gift,
  Info,
  HelpCircle,
  BookOpen,
  Globe,
  Settings2,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/language-provider';
import { useRouter } from 'expo-router';
import { useThemedColors } from '@/lib/utils/theme';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  colors: ReturnType<typeof useThemedColors>;
}

function SettingsItem({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
  colors,
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
      <Text className="flex-1 text-base" style={{ color: danger ? colors.dangerText : colors.text }}>
        {label}
      </Text>
      {showChevron && <ChevronRight size={20} color={colors.textMuted} />}
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
  const { t } = useTranslation();
  const { language, supportedLanguages } = useLanguage();
  const { deleteAccount, signOut } = useAuth();
  const colors = useThemedColors();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const currentLanguageName =
    supportedLanguages.find((l) => l.code === language)?.nativeName || 'English';
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
    console.log('--clicked');
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      // Fallback to App Store URL if in-app review not available
      Linking.openURL(APP_URLS.appStore);
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `I've been using PCOS Food Scanner to manage my diet and it's been really helpful! If you have PCOS, check it out:\n\n${APP_URLS.appStore}`,
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
    <PageLayout title={t('settings.title')}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      >
        {/* Share and Earn Banner */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/referral');
          }}
          className="mx-4 mb-4"
        >
          <View className="rounded-2xl overflow-hidden" style={{ minHeight: 140 }}>
            <ImageBackground
              source={require('@/assets/images/referral-image.png')}
              style={StyleSheet.absoluteFill}
              imageStyle={{ borderRadius: 16 }}
            >
              <LinearGradient
                colors={['rgba(13, 148, 136, 0.75)', 'rgba(15, 118, 110, 0.70)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="p-5 justify-between flex-row items-center" style={{ minHeight: 140 }}>
                <View className="flex-row items-center flex-1">
                  <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center mr-4">
                    <Gift size={28} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">{t('settings.share.banner.title')}</Text>
                    <Text className="text-white/95 text-sm">{t('settings.share.banner.subtitle')}</Text>
                    <View className="bg-white/25 rounded-lg px-3 py-1.5 self-start mt-2">
                      <Text className="text-white font-bold text-sm">{t('settings.share.banner.earnPerReferral')}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.9)" />
              </View>
            </ImageBackground>
          </View>
        </Pressable>

        {/* Account Section */}
        <SettingsGroup title={t('settings.sections.account')} colors={colors}>
          <SettingsItem
            icon={User}
            label={t('settings.items.profile')}
            onPress={() => router.push('/profile')}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Settings2}
            label={t('settings.items.updatePreferences')}
            onPress={() => router.push('/preferences')}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/language');
            }}
            className="flex-row items-center py-4 px-1"
          >
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <Globe size={18} color={colors.textSecondary} />
            </View>
            <Text className="flex-1 text-base" style={{ color: colors.text }}>
              {t('settings.items.language')}
            </Text>
            <Text className="text-sm mr-2" style={{ color: colors.textMuted }}>
              {currentLanguageName}
            </Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </Pressable>
        </SettingsGroup>

        {/* Appearance Section - Commented out, using light theme as default */}
        {/* <SettingsGroup title={t('settings.sections.appearance')} colors={colors}>
          <Pressable onPress={() => setTheme('system')} className="flex-row items-center py-4 px-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor:
                  theme === 'system' ? colors.iconBackgroundActive : colors.iconBackground,
              }}
            >
              <Smartphone size={18} color={theme === 'system' ? '#10B981' : colors.textSecondary} />
            </View>
            <Text
              className="flex-1 text-base"
              style={{ color: theme === 'system' ? '#10B981' : colors.text }}
            >
              {t('settings.appearance.system')}
            </Text>
            {theme === 'system' && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
          </Pressable>
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <Pressable onPress={() => setTheme('light')} className="flex-row items-center py-4 px-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor:
                  theme === 'light' ? colors.iconBackgroundActive : colors.iconBackground,
              }}
            >
              <Sun size={18} color={theme === 'light' ? '#10B981' : colors.textSecondary} />
            </View>
            <Text
              className="flex-1 text-base"
              style={{ color: theme === 'light' ? '#10B981' : colors.text }}
            >
              {t('settings.appearance.light')}
            </Text>
            {theme === 'light' && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
          </Pressable>
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <Pressable onPress={() => setTheme('dark')} className="flex-row items-center py-4 px-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor:
                  theme === 'dark' ? colors.iconBackgroundActive : colors.iconBackground,
              }}
            >
              <Moon size={18} color={theme === 'dark' ? '#10B981' : colors.textSecondary} />
            </View>
            <Text
              className="flex-1 text-base"
              style={{ color: theme === 'dark' ? '#10B981' : colors.text }}
            >
              {t('settings.appearance.dark')}
            </Text>
            {theme === 'dark' && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
          </Pressable>
        </SettingsGroup> */}

        {/* Support Section */}
        <SettingsGroup title={t('settings.sections.support')} colors={colors}>
          <SettingsItem
            icon={MessageCircle}
            label={t('settings.items.giveFeedback')}
            onPress={() => router.push('/feedback')}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Star}
            label={t('settings.items.rateApp')}
            onPress={handleRateApp}
            colors={colors}
          />
        </SettingsGroup>

        {/* About Section */}
        <SettingsGroup title={t('settings.sections.about')} colors={colors}>
          <SettingsItem
            icon={HelpCircle}
            label={t('settings.items.howItWorks')}
            onPress={() => router.push('/how-it-works')}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={BookOpen}
            label={t('settings.items.nutritionGuide')}
            onPress={() => router.push('/nutrition-guide')}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Info}
            label={t('settings.items.aboutPcos')}
            onPress={() =>
              Linking.openURL('https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome')
            }
            colors={colors}
          />
        </SettingsGroup>

        {/* Legal Section */}
        <SettingsGroup title={t('settings.sections.legal')} colors={colors}>
          <SettingsItem
            icon={FileText}
            label={t('settings.items.termsOfService')}
            onPress={() => Linking.openURL(APP_URLS.terms)}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Shield}
            label={t('settings.items.privacyPolicy')}
            onPress={() => Linking.openURL(APP_URLS.privacy)}
            colors={colors}
          />
        </SettingsGroup>

        {/* Account Actions */}
        <SettingsGroup colors={colors}>
          <SettingsItem
            icon={LogOut}
            label={t('settings.items.logOut')}
            onPress={() => setShowLogoutModal(true)}
            showChevron={false}
            colors={colors}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Trash2}
            label={t('settings.items.deleteAccount')}
            onPress={showDeleteAlert}
            showChevron={false}
            danger
            colors={colors}
          />
        </SettingsGroup>

        {/* App Version */}
        <View className="items-center mt-4">
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            {t('settings.version', { version: '1.0.0' })}
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={t('logout.title')}
        message={t('logout.message')}
        confirmText={t('logout.confirm')}
        cancelText={t('common.cancel')}
      />

      {/* Share & Earn Modal */}
      <Modal visible={showShareModal} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: colors.modalOverlay }}
          onPress={() => setShowShareModal(false)}
        >
          <Pressable
            className="w-full rounded-3xl overflow-hidden"
            style={{ backgroundColor: colors.modalBackground }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6">
              {/* Header Icon */}
              <View className="w-16 h-16 rounded-full bg-teal-100 items-center justify-center self-center mb-4">
                <Gift size={32} color="#0D9488" />
              </View>

              <Text
                className="text-xl font-bold text-center mb-2"
                style={{ color: colors.text }}
              >
                {t('settings.share.modal.title')}
              </Text>
              <Text className="text-center mb-6" style={{ color: colors.textSecondary }}>
                {t('settings.share.modal.subtitle')}
              </Text>

              {/* How it works steps */}
              <View className="mb-6">
                <Text className="font-semibold mb-3" style={{ color: colors.text }}>
                  {t('settings.share.modal.howItWorks')}
                </Text>

                <View className="flex-row items-start mb-3">
                  <View className="w-6 h-6 rounded-full bg-teal-100 items-center justify-center mr-3 mt-0.5">
                    <Text className="text-teal-700 font-bold text-xs">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }}>{t('settings.share.modal.step1')}</Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-3">
                  <View className="w-6 h-6 rounded-full bg-teal-100 items-center justify-center mr-3 mt-0.5">
                    <Text className="text-teal-700 font-bold text-xs">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }}>{t('settings.share.modal.step2')}</Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="w-6 h-6 rounded-full bg-teal-100 items-center justify-center mr-3 mt-0.5">
                    <Text className="text-teal-700 font-bold text-xs">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }}>{t('settings.share.modal.step3')}</Text>
                  </View>
                </View>
              </View>

              {/* Reward highlight */}
              <View className="bg-teal-50 rounded-2xl p-4 mb-6 border border-teal-100">
                <Text className="text-teal-800 text-center font-semibold">
                  {t('settings.share.modal.reward')}
                </Text>
              </View>

              <View className="gap-3">
                <Pressable
                  onPress={() => {
                    setShowShareModal(false);
                    handleShare();
                  }}
                  className="py-4 rounded-2xl bg-teal-600"
                >
                  <Text className="text-white text-center font-semibold">{t('settings.share.modal.shareNow')}</Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowShareModal(false)}
                  className="py-4 rounded-2xl"
                  style={{ backgroundColor: colors.inputBackground }}
                >
                  <Text className="text-center font-medium" style={{ color: colors.text }}>
                    {t('settings.share.modal.maybeLater')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
                {t('deleteAccount.title')}
              </Text>
              <Text className="text-center mb-4" style={{ color: colors.textSecondary }}>
                {t('deleteAccount.message')}
              </Text>

              <Text className="font-medium mb-2" style={{ color: colors.text }}>
                {t('deleteAccount.reasonPrompt')}
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
                placeholder={t('deleteAccount.additionalComments')}
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
                    {t('deleteAccount.deleting')}
                  </Text>
                </View>
              )}

              <View className="gap-3">
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={!deleteReason || isDeleting}
                  className="py-4 rounded-2xl"
                  style={{
                    backgroundColor: !deleteReason || isDeleting ? '#FCA5A5' : colors.dangerText,
                  }}
                >
                  <Text className="text-white text-center font-semibold">
                    {isDeleting ? t('deleteAccount.deleting') : t('deleteAccount.confirm')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="py-4 rounded-2xl"
                  style={{ backgroundColor: colors.inputBackground }}
                >
                  <Text className="text-center font-medium" style={{ color: colors.text }}>
                    {t('common.cancel')}
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
