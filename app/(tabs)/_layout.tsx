import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, DebtsIcon, AdvisorIcon, SettingsIcon } from '@/components/icons/tab-icons';
import { useTabBar } from '@/context/tab-bar-provider';
import * as Haptics from 'expo-haptics';

function CustomTabBar({ state, navigation }: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hideTabBar } = useTabBar();

  const mainTabs = state.routes.filter((route: any) => route.name !== 'advisor/index');

  const handleAdvisorPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hideTabBar();
    router.push('/(tabs)/advisor');
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 px-5"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      {/* Main Tabs Container */}
      <View className="flex-1 h-[60px] rounded-[30px] overflow-hidden">
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-[30px] border border-white/10 bg-white/5" />
        <View className="flex-1 flex-row items-center justify-around px-5">
          {mainTabs.map((route: any) => {
            const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const color = isFocused ? '#10B981' : '#9BA1A6';

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="items-center justify-center p-2"
              >
                {route.name === 'home/index' && <HomeIcon size={28} color={color} />}
                {route.name === 'debts/index' && <DebtsIcon size={28} color={color} />}
                {route.name === 'settings/index' && <SettingsIcon size={28} color={color} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Advisor Button */}
      <Pressable onPress={handleAdvisorPress}>
        <View className="w-[60px] h-[60px] rounded-full items-center justify-center bg-emerald-500/30">
          <AdvisorIcon size={26} color="#10B981" />
        </View>
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const { isTabBarVisible } = useTabBar();

  return (
    <Tabs
      tabBar={(props) => (isTabBarVisible ? <CustomTabBar {...props} /> : null)}
      screenOptions={{
        sceneStyle: { backgroundColor: '#0F0F0F' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="debts/index" />
      <Tabs.Screen name="settings/index" />
      <Tabs.Screen name="advisor/index" />
    </Tabs>
  );
}
