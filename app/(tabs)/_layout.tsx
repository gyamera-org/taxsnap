import { Tabs } from 'expo-router';
import {
  View,
  Pressable,
  Text,
  Platform,
  Animated,
  type GestureResponderEvent,
} from 'react-native';
import { Plus, Apple, Activity, CalendarHeart, X, Dumbbell } from 'lucide-react-native';
import { usePathname } from 'expo-router';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
// import { AuthGuard } from '@/components/auth-guard';
import { LoggerModal } from '@/components/logger-modal';
import { useTheme } from '@/context/theme-provider';
import { ThemeWrapper } from '@/components/theme-wrapper';

const HIDDEN_ROUTES = [
  '/settings/index',
  '/settings/personal-details',
  '/settings/reminder-settings',
  '/settings/fitness-goals',
  '/settings/nutrition-goals',
  '/settings/weight',
  '/settings/supplements',
  '/settings/medical-sources',
  '/settings/report',
  '/log-exercise',
  '/log-mood',
  '/log-water',
  '/log-meal',
  '/log-supplements',
  '/period-tracker',
  '/scan-food',
];

export default function TabLayout() {
  const pathname = usePathname();
  const shouldHideTabBar = HIDDEN_ROUTES.includes(pathname);
  const tabBarAnimation = useRef(new Animated.Value(1)).current;
  const [showLoggerModal, setShowLoggerModal] = useState(false);
  const { isDark } = useTheme();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    Animated.timing(tabBarAnimation, {
      toValue: shouldHideTabBar ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldHideTabBar]);

  return (
    <ThemeWrapper className="flex-1">
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
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
            backgroundColor: isDark ? '#1F2937' : 'white',
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
                <View className={`w-14 h-14 rounded-full items-center justify-center shadow-lg ${isDark ? 'bg-white' : 'bg-black'}`}>
                  {showLoggerModal ? (
                    <X size={28} color={isDark ? "black" : "white"} />
                  ) : (
                    <Plus size={28} color={isDark ? "black" : "white"} />
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
                Icon={Dumbbell}
                isActive={pathname === '/exercise'}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="progress/index"
          options={{
            tabBarButton: (props) => (
              <TabButton
                {...props}
                label="Progress"
                Icon={Activity}
                isActive={pathname === '/progress'}
              />
            ),
          }}
        />
        {/* Settings Tab */}

        {/* Hidden screens */}
        <Tabs.Screen name="settings/index" options={{ href: null, headerShown: false }} />
        <Tabs.Screen
          name="settings/personal-details"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="settings/reminder-settings"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen name="settings/fitness-goals" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="settings/nutrition-goals" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="settings/weight" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="settings/supplements" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="settings/report" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="settings/medical-sources" options={{ href: null, headerShown: false }} />
      </Tabs>

        {/* Logger Modal */}
        <LoggerModal visible={showLoggerModal} onClose={() => setShowLoggerModal(false)} />
      </View>
    </ThemeWrapper>
  );
}

type TabButtonProps = {
  Icon: React.ElementType;
  label: string;
  isActive: boolean;
  onPress?: (e: GestureResponderEvent) => void;
};

function TabButton({ Icon, label, isActive, onPress, ...rest }: TabButtonProps) {
  const { isDark } = useTheme();
  
  const activeColor = isDark ? 'white' : 'black';
  const inactiveColor = isDark ? '#6B7280' : '#C1C1C1';
  
  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-start pt-1" {...rest}>
      <Icon size={24} color={isActive ? activeColor : inactiveColor} />
      <Text 
        className={cn(
          'text-sm mt-1', 
          isActive 
            ? `font-medium ${isDark ? 'text-white' : 'text-black'}` 
            : `${isDark ? 'text-gray-500' : 'text-[#C1C1C1]'}`
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
