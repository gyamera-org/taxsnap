import { Tabs } from 'expo-router';
import {
  View,
  Pressable,
  Text,
  Platform,
  Animated,
  type GestureResponderEvent,
} from 'react-native';
import { Settings, TextSearch, ListTodo, ScanBarcode } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

const HIDDEN_ROUTES = [
  '/scan',
  '/settings/personal-details',
  '/settings/adjust-hair-goals',
  '/products/add',
  '/products/[id]',
];

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldHideTabBar = HIDDEN_ROUTES.includes(pathname);
  const tabBarAnimation = useRef(new Animated.Value(1)).current;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    Animated.timing(tabBarAnimation, {
      toValue: shouldHideTabBar ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldHideTabBar]);

  return (
    <View className="flex-1 bg-white">
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
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
        <Tabs.Screen
          name="routines/index"
          options={{
            tabBarButton: (props) => (
              <TabButton
                {...props}
                label="Routines"
                Icon={ListTodo}
                isActive={pathname === '/routines'}
                onPress={(e) => router.replace('/routines')}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="products/index"
          options={{
            tabBarButton: (props) => (
              <TabButton
                {...props}
                label="Products"
                Icon={TextSearch}
                isActive={pathname === '/products'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            tabBarButton: (props) => (
              <TabButton
                {...props}
                label="Settings"
                Icon={Settings}
                isActive={pathname === '/settings'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scan/index"
          options={{
            headerShown: false,
            tabBarButton: () => null,
          }}
        />

        <Tabs.Screen
          name="settings/personal-details"
          options={{ href: null, headerShown: false }}
        />

        <Tabs.Screen
          name="settings/adjust-hair-goals"
          options={{ href: null, headerShown: false }}
        />

        <Tabs.Screen name="products/[id]" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="products/add" options={{ href: null, headerShown: false }} />
      </Tabs>

      {!shouldHideTabBar && (
        <Pressable
          onPress={() => router.push('/scan')}
          className="absolute right-6 bottom-14 w-16 h-16 rounded-full bg-black items-center justify-center z-50"
          style={{
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <ScanBarcode size={28} color="white" />
        </Pressable>
      )}
    </View>
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
