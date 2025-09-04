import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'expo-router/entry';
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
        <Stack>
          {/* Main App Entry */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Tab Navigation */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Authentication */}
          <Stack.Screen name="auth/index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />

          {/* Onboarding */}
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />

          {/* Logging Screens */}
          <Stack.Screen name="log-meal" options={{ headerShown: false }} />
          <Stack.Screen name="log-exercise" options={{ headerShown: false }} />
          <Stack.Screen name="log-water" options={{ headerShown: false }} />

          <Stack.Screen name="log-mood" options={{ headerShown: false }} />
          <Stack.Screen name="log-symptoms" options={{ headerShown: false }} />
          <Stack.Screen name="log-supplements" options={{ headerShown: false }} />

          {/* Scanning Screens */}
          <Stack.Screen name="scan-food" options={{ headerShown: false }} />

          {/* Cycle Tracking */}

          <Stack.Screen name="cycle-history" options={{ headerShown: false }} />
          <Stack.Screen name="edit-period" options={{ headerShown: false }} />

          {/* Monetization */}
          <Stack.Screen name="paywall" options={{ headerShown: false }} />

          {/* Error Handling */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </RootProvider>
    </ErrorBoundary>
  );
}
