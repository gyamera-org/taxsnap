import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';

interface DefaultLoaderProps {
  size?: number;
  showSpinner?: boolean;
}

export function DefaultLoader({ size = 80, showSpinner = true }: DefaultLoaderProps) {
  return (
    <View 
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: '#FEF9F9' }}
    >
      <View className="items-center">
        {/* App Icon */}
        <Image
          source={require('@/assets/images/icon.png')}
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.2, // Slightly rounded corners
          }}
          resizeMode="contain"
        />
        
        {/* Loading Spinner */}
        {showSpinner && (
          <ActivityIndicator 
            size="large" 
            color="#EC4899" // Pink color to match the app theme
            style={{ marginTop: 20 }}
          />
        )}
      </View>
    </View>
  );
}