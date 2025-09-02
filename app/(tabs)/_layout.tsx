import { Tabs } from 'expo-router';
import {
  View,
  Pressable,
  Text,
  Platform,
  Animated,
  type GestureResponderEvent,
} from 'react-native';
import { Settings, Plus, Apple, Activity, CalendarHeart, X } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { SubscriptionGuard } from '@/components/subscription-guard';
import { LoggerModal } from '@/components/logger-modal';

const HIDDEN_ROUTES = [
  '/settings/personal-details',
  '/settings/reminder-settings',
  '/settings/fitness-goals',
  '/settings/nutrition-goals',
  '/settings/weight',
  '/settings/skincare-products',
  '/settings/haircare-products',
  '/settings/supplements',
  '/settings/add-skincare-product',
  '/settings/add-haircare-product',
  '/log-exercise',
  '/log-mood',
  '/log-water',
  '/log-sleep',
  '/log-meal',
  '/log-supplements',
  '/period-tracker',
  '/scan-food',
  '/scan-beauty',
];

export default function TabLayout() {
  const pathname = usePathname();
  const shouldHideTabBar = HIDDEN_ROUTES.includes(pathname);
  const tabBarAnimation = useRef(new Animated.Value(1)).current;
  const [showLoggerModal, setShowLoggerModal] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    Animated.timing(tabBarAnimation, {
      toValue: shouldHideTabBar ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldHideTabBar]);

  return (
    <AuthGuard>
      <SubscriptionGuard requireSubscription={true}>
        <View className="flex-1 bg-white">
          <Tabs
            backBehavior="initialRoute"
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: true,
              tabBarStyle: {
                transform: [
                  {
                    translateY: tabBarAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 84,
                paddingBottom: 14,
                paddingTop: 8,
                backgroundColor: 'white',
                borderTopWidth: 0,
                elevation: Platform.OS === 'android' ? 10 : 0,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: -2 },
                shadowRadius: 12,
              },
            }}
          >
            {/* Nutrition Tab - Macro tracking, food scanning, meal history */}
            <Tabs.Screen
              name="nutrition/index"
              options={{
                tabBarButton: (props) => (
                  <TabButton
                    {...props}
                    label="Nutrition"
                    Icon={Apple}
                    isActive={pathname === '/nutrition'}
                  />
                ),
              }}
            />

            {/* Cycle Tab - Period tracking, symptom logging, predictions */}
            <Tabs.Screen
              name="cycle/index"
              options={{
                tabBarButton: (props) => (
                  <TabButton
                    {...props}
                    label="Cycle"
                    Icon={CalendarHeart}
                    isActive={pathname === '/cycle'}
                  />
                ),
              }}
            />

            {/* Logger Tab - Center position with special styling */}
            <Tabs.Screen
              name="logger/index"
              options={{
                tabBarButton: (props) => (
                  <Pressable
                    onPress={() =>
                      showLoggerModal ? setShowLoggerModal(false) : setShowLoggerModal(true)
                    }
                    className="flex-1 items-center justify-center"
                    style={{ marginTop: -20 }}
                  >
                    <View className="w-14 h-14 rounded-full bg-black items-center justify-center shadow-lg">
                      {showLoggerModal ? (
                        <X size={28} color="white" />
                      ) : (
                        <Plus size={28} color="white" />
                      )}
                    </View>
                  </Pressable>
                ),
              }}
            />

            {/* Exercise Tab - Workouts, performance tracking, cycle-optimized plans */}
            <Tabs.Screen
              name="exercise/index"
              options={{
                tabBarButton: (props) => (
                  <TabButton
                    {...props}
                    label="Workouts"
                    Icon={Activity}
                    isActive={pathname === '/exercise'}
                  />
                ),
              }}
            />

            {/* Settings Tab */}
            <Tabs.Screen
              name="settings/index"
              options={{
                tabBarButton: (props) => (
                  <TabButton
                    {...props}
                    label="My Profile"
                    Icon={Settings}
                    isActive={pathname === '/settings'}
                  />
                ),
              }}
            />

            {/* Hidden screens */}
            <Tabs.Screen
              name="settings/personal-details"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
              name="settings/reminder-settings"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
              name="settings/fitness-goals"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
              name="settings/nutrition-goals"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen name="settings/weight" options={{ href: null, headerShown: false }} />
            <Tabs.Screen
              name="settings/skincare-products"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
              name="settings/haircare-products"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen name="settings/supplements" options={{ href: null, headerShown: false }} />
            <Tabs.Screen
              name="settings/add-skincare-product"
              options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
              name="settings/add-haircare-product"
              options={{ href: null, headerShown: false }}
            />
          </Tabs>

          {/* Logger Modal */}
          <LoggerModal visible={showLoggerModal} onClose={() => setShowLoggerModal(false)} />
        </View>
      </SubscriptionGuard>
    </AuthGuard>
  );
}

type TabButtonProps = {
  Icon: React.ElementType;
  label: string;
  isActive: boolean;
  onPress?: (e: GestureResponderEvent) => void;
};

function TabButton({ Icon, label, isActive, onPress, ...rest }: TabButtonProps) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-start pt-1" {...rest}>
      <Icon size={24} color={isActive ? 'black' : '#C1C1C1'} />
      <Text className={cn('text-sm mt-1', isActive ? 'text-black font-medium' : 'text-[#C1C1C1]')}>
        {label}
      </Text>
    </Pressable>
  );
}
