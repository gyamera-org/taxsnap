import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

// Global error handling for unhandled promise rejections
if (typeof global !== 'undefined') {
  global.addEventListener?.('unhandledrejection', (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

import { Stack } from 'expo-router';

import { RootProvider } from '@/context/root-provider';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function Layout() {
  return (
    <ErrorBoundary>
      <RootProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          {/* Main App Entry */}
          <Stack.Screen name="index" />

          {/* Tab Navigation */}
          <Stack.Screen name="(tabs)" />

          {/* Onboarding */}
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />

          {/* Authentication */}
          <Stack.Screen name="auth/index" />
          <Stack.Screen name="auth/callback" />

          {/* Monetization */}
          <Stack.Screen name="paywall" />

          {/* Scan Details */}
          <Stack.Screen name="scan/[id]" />

          {/* Settings Pages */}
          <Stack.Screen name="profile" />
          <Stack.Screen name="feedback" />
          <Stack.Screen name="referral" />
          <Stack.Screen name="how-it-works" />
          <Stack.Screen name="nutrition-guide" />
          <Stack.Screen name="language" />

          {/* Error Handling */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </RootProvider>
    </ErrorBoundary>
  );
}
