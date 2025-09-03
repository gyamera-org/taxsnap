import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/context/auth-provider';
import { router } from 'expo-router';
import { DefaultLoader } from '@/components/ui/default-loader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to auth
      router.replace('/auth?mode=signin');
    }
  }, [user, loading]);

  if (loading) {
    return <DefaultLoader />;
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Redirecting...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
