import type { PropsWithChildren } from 'react';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { AuthProvider } from './auth-provider';
import { RevenueCatProvider } from './revenuecat-provider';
import { NotificationProvider } from './notification-provider';
import { ThemeProvider, useTheme } from './theme-provider';
import { TabBarProvider } from './tab-bar-provider';
import { DevModeProvider } from './dev-mode-provider';
import { LanguageProvider } from './language-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      theme={isDark ? 'dark' : 'light'}
      toastOptions={{
        style: {
          paddingVertical: 12,
          paddingHorizontal: 16,
        },
        titleStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        descriptionStyle: {
          fontSize: 12,
        },
      }}
    />
  );
}

export const RootProvider = ({ children }: PropsWithChildren) => {
  useReactQueryDevTools(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <DevModeProvider>
          <ThemeProvider>
            <AuthProvider>
              <RevenueCatProvider>
                <NotificationProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <BottomSheetModalProvider>
                      <TabBarProvider>
                        {children}
                        <ThemedToaster />
                      </TabBarProvider>
                    </BottomSheetModalProvider>
                  </GestureHandlerRootView>
                </NotificationProvider>
              </RevenueCatProvider>
            </AuthProvider>
          </ThemeProvider>
        </DevModeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};
