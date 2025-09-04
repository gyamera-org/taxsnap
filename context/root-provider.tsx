import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { AuthProvider } from './auth-provider';
import { RevenueCatProvider } from './revenuecat-provider';
import { PaywallProvider } from './paywall-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const RootProvider = ({ children }: PropsWithChildren) => {
  useReactQueryDevTools(queryClient);

  useEffect(() => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      if (Platform.OS === 'ios') {
        const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
        if (apiKey) {
          Purchases.configure({ apiKey });
        } else {
          console.warn('RevenueCat API key not found');
        }
      }
    } catch (error) {
      console.error('RevenueCat configuration error:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RevenueCatProvider>
          <PaywallProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetModalProvider>
                {children}
                <Toaster />
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </PaywallProvider>
        </RevenueCatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
