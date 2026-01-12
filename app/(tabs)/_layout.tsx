// Modal disabled for initial release
// import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, View, Linking } from 'react-native';
// Modal disabled for initial release
// import { Modal, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabBar } from '@/context/tab-bar-provider';
import * as Haptics from 'expo-haptics';
import { Camera } from 'expo-camera';
// Modal handlers disabled for initial release
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useResponsive } from '@/lib/utils/responsive';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
// Modal disabled for initial release
// import { useAuth } from '@/context/auth-provider';
import { HomeIcon, ReceiptsIcon, SettingsIcon } from '@/components/icons/tab-icons';
import { Plus } from 'lucide-react-native';
// Modal disabled for initial release
// import { Camera as CameraIcon, Image as ImageIcon, FileText, X } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

interface TabBarProps {
  state: any;
  navigation: any;
}

interface TabItemProps {
  routeName: string;
  icon: React.ComponentType<{ color: string; size: number; filled?: boolean }>;
  isActive: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemedColors>;
}

function TabItem({ icon: Icon, isActive, onPress, colors }: TabItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <View
        style={[
          styles.tabIconWrapper,
          isActive && {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        <Icon
          color={isActive ? colors.primary : colors.tabBarInactive}
          size={22}
          filled={isActive}
        />
      </View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { tabBarWidth } = useResponsive();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { hideTabBar } = useTabBar();
  // Modal disabled for initial release
  // const { session } = useAuth();
  // Modal disabled for initial release
  // const [showScanOptions, setShowScanOptions] = useState(false);
  // const [isPickingDocument, setIsPickingDocument] = useState(false);

  const tabs = [
    { name: 'home/index', icon: HomeIcon },
    { name: 'receipts/index', icon: ReceiptsIcon },
    { name: 'settings/index', icon: SettingsIcon },
  ];

  const getIsActive = (routeName: string) => {
    const currentIndex = state.routes.findIndex((r: any) => r.name === routeName);
    return state.index === currentIndex;
  };

  const handleTabPress = (routeName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const route = state.routes.find((r: any) => r.name === routeName);
    if (route) {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    }
  };

  // Modal disabled - open camera directly
  // const handleScanPress = () => {
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  //   setShowScanOptions(true);
  // };

  const handleScanPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();

    if (status === 'granted') {
      hideTabBar(); // Hide tab bar before navigating to scan screen
      router.push('/(tabs)/scan');
    } else if (!canAskAgain) {
      // User previously denied - offer Settings option
      Alert.alert(
        t('scan.permissionTitle'),
        t('scan.permissionDeniedText'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('scan.openSettings'), onPress: () => Linking.openSettings() },
        ]
      );
    }
    // If canAskAgain is true but status is not granted, user dismissed the dialog - don't show another prompt
  };

  // Modal handlers disabled for initial release
  // const handleCameraPress = async () => {
  //   setShowScanOptions(false);
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   const { status } = await Camera.requestCameraPermissionsAsync();
  //   if (status === 'granted') {
  //     router.push('/(tabs)/scan');
  //   } else {
  //     Alert.alert(t('scan.permissionTitle'), t('scan.permissionText'), [
  //       { text: t('common.close') },
  //     ]);
  //   }
  // };

  // const handleImagePress = async () => {
  //   setShowScanOptions(false);
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   if (!session?.user?.id) {
  //     Alert.alert(t('common.error'), t('common.notLoggedIn', 'Please sign in to scan receipts.'));
  //     return;
  //   }
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert(
  //       t('scan.galleryPermissionTitle', 'Photo Library Access Required'),
  //       t('scan.galleryPermissionText', 'TaxSnap needs access to your photo library to select receipt images.'),
  //       [{ text: t('common.close') }]
  //     );
  //     return;
  //   }
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ['images'],
  //     quality: 0.8,
  //     allowsEditing: true,
  //     aspect: [3, 4],
  //     base64: true,
  //   });
  //   if (!result.canceled && result.assets[0]?.base64) {
  //     const { uri, base64 } = result.assets[0];
  //     router.push({
  //       pathname: '/receipt/verify',
  //       params: { imageBase64: base64, localUri: uri, isScanning: 'true' },
  //     });
  //   }
  // };

  // const handlePDFPress = async () => {
  //   if (isPickingDocument) return;
  //   setShowScanOptions(false);
  //   setIsPickingDocument(true);
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: 'application/pdf',
  //       copyToCacheDirectory: true,
  //     });
  //     if (!result.canceled && result.assets[0]) {
  //       router.push({
  //         pathname: '/receipt/verify',
  //         params: { imageUri: result.assets[0].uri, isPDF: 'true' },
  //       });
  //     }
  //   } catch (error) {
  //     console.error('PDF picker error:', error);
  //     Alert.alert(
  //       t('common.error'),
  //       t('scan.pdfError', 'Failed to select PDF. Please try again.'),
  //       [{ text: t('common.close') }]
  //     );
  //   } finally {
  //     setIsPickingDocument(false);
  //   }
  // };

  // const closeScanOptions = () => {
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   setShowScanOptions(false);
  // };

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        {/* Tab Bar */}
        <View
          style={[
            styles.tabBarWrapper,
            {
              maxWidth: tabBarWidth,
              backgroundColor: isDark ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              shadowColor: '#000000',
            },
          ]}
        >
          {/* Glass effect overlay */}
          <View style={styles.glassOverlay} pointerEvents="none">
            <View
              style={[
                styles.glassHighlight,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
            />
          </View>

          <View style={styles.tabBarContent}>
            {/* Home tab */}
            <TabItem
              routeName={tabs[0].name}
              icon={tabs[0].icon}
              isActive={getIsActive(tabs[0].name)}
              onPress={() => handleTabPress(tabs[0].name)}
              colors={colors}
            />

            {/* Receipts tab */}
            <TabItem
              routeName={tabs[1].name}
              icon={tabs[1].icon}
              isActive={getIsActive(tabs[1].name)}
              onPress={() => handleTabPress(tabs[1].name)}
              colors={colors}
            />

            {/* Settings tab */}
            <TabItem
              routeName={tabs[2].name}
              icon={tabs[2].icon}
              isActive={getIsActive(tabs[2].name)}
              onPress={() => handleTabPress(tabs[2].name)}
              colors={colors}
            />

            {/* Scan Button - opens camera directly */}
            <Pressable
              onPress={handleScanPress}
              style={styles.scanButtonWrapper}
            >
              <LinearGradient
                colors={[colors.primary, isDark ? '#0099BB' : '#00A8CC']}
                style={styles.scanButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Scan Options Modal - Disabled for initial release (PDF not working)
      <Modal
        visible={showScanOptions}
        transparent
        animationType="fade"
        onRequestClose={closeScanOptions}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)' },
          ]}
          onPress={closeScanOptions}
        >
          <Pressable
            style={[
              styles.optionsCard,
              {
                backgroundColor: 'transparent',
                marginBottom: insets.bottom > 0 ? insets.bottom + 90 : 106,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.optionsGrid}>
              <Pressable
                style={[
                  styles.gridOption,
                  { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' },
                ]}
                onPress={handleCameraPress}
              >
                <CameraIcon size={26} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.gridOptionLabel, { color: colors.text }]}>
                  {t('scan.takePhoto', 'Take Photo')}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.gridOption,
                  { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' },
                ]}
                onPress={handleImagePress}
              >
                <ImageIcon size={26} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.gridOptionLabel, { color: colors.text }]}>
                  {t('scan.uploadImage', 'Upload Image')}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.gridOption,
                  { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' },
                ]}
                onPress={handlePDFPress}
              >
                <FileText size={26} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.gridOptionLabel, { color: colors.text }]}>
                  {t('scan.uploadPDF', 'Upload PDF')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  tabBarWrapper: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  glassHighlight: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  tabButton: {
    padding: 4,
  },
  tabIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonWrapper: {
    padding: 4,
    shadowColor: '#00C0E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },
  optionsCard: {
    borderRadius: 24,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: 'transparent',
  },
  gridOption: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default function TabLayout() {
  const { isTabBarVisible } = useTabBar();

  return (
    <Tabs
      tabBar={(props: TabBarProps) => (isTabBarVisible ? <CustomTabBar {...props} /> : null)}
      screenOptions={{
        sceneStyle: { backgroundColor: 'transparent' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="scan/index" />
      <Tabs.Screen name="receipts/index" />
      <Tabs.Screen name="settings/index" />
    </Tabs>
  );
}
