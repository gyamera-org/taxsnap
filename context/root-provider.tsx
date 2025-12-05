import type { PropsWithChildren } from 'react';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { AuthProvider } from './auth-provider';
import { RevenueCatProvider } from './revenuecat-provider';
// import { NotificationProvider } from './notification-provider';
import { ThemeProvider } from './theme-provider';
import { TabBarProvider } from './tab-bar-provider';
import { LanguageProvider } from './language-provider';
import { OnboardingProvider } from './onboarding-provider';
import '@/lib/i18n';

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <OnboardingProvider>
              <RevenueCatProvider>
                {/* <NotificationProvider> */}
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <BottomSheetModalProvider>
                    <TabBarProvider>
                      {children}
                      <Toaster theme="light" />
                    </TabBarProvider>
                  </BottomSheetModalProvider>
                </GestureHandlerRootView>
                {/* </NotificationProvider> */}
              </RevenueCatProvider>
            </OnboardingProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
