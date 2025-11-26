import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { HomeIcon, DebtsIcon, SettingsIcon } from '@/components/icons/tab-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: '#0F0F0F' },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9BA1A6',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 16,
          paddingHorizontal: 20,
          elevation: 0,
          bottom: 25,
          marginHorizontal: 40,
          borderRadius: 30,
          overflow: 'hidden',
          alignSelf: 'center',
        },
        tabBarBackground: () => (
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(18, 18, 18, 0.8)',
                borderRadius: 30,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </BlurView>
        ),
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="debts/index"
        options={{
          tabBarIcon: ({ color }) => <DebtsIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
