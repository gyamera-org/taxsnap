import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { PageLayout, GlassCard } from '@/components/layouts';
import {
  User,
  Bell,
  Shield,
  FileText,
  MessageCircle,
  Star,
  LogOut,
  ChevronRight,
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
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-1"
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
          danger ? 'bg-red-500/20' : 'bg-white/10'
        }`}
      >
        <Icon size={18} color={danger ? '#EF4444' : '#FFFFFF'} />
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

  const handleLogout = async () => {
    // TODO: Implement logout
    router.replace('/auth');
  };

  return (
    <PageLayout title="Settings">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
      >
        {/* Account Section */}
        <SettingsGroup title="Account">
          <SettingsItem
            icon={User}
            label="Profile"
            onPress={() => {}}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Bell}
            label="Notifications"
            onPress={() => {}}
          />
        </SettingsGroup>

        {/* Support Section */}
        <SettingsGroup title="Support">
          <SettingsItem
            icon={MessageCircle}
            label="Contact Us"
            onPress={() =>
              Linking.openURL('mailto:support@debt-free.app?subject=Support Request')
            }
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Star}
            label="Rate the App"
            onPress={() => {}}
          />
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

        {/* Logout */}
        <SettingsGroup>
          <SettingsItem
            icon={LogOut}
            label="Log Out"
            onPress={handleLogout}
            showChevron={false}
            danger
          />
        </SettingsGroup>

        {/* App Version */}
        <View className="items-center mt-4">
          <Text className="text-gray-600 text-sm">Debt Free v1.0.0</Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
