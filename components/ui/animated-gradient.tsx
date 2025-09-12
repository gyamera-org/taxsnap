import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedGradientProps {
  colors: string[];
  children?: React.ReactNode;
  className?: string;
  style?: any;
}

export function AnimatedGradient({ colors, children, className = '', style }: AnimatedGradientProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  return (
    <View className={`overflow-hidden ${className}`} style={style}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
          opacity,
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            width: width * 2,
          }}
        />
      </Animated.View>
      
      {/* Overlay gradient for depth */}
      <LinearGradient
        colors={[colors[0] + '80', colors[1] + '40', colors[2] + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      {/* Content */}
      <View className="relative z-10">
        {children}
      </View>
    </View>
  );
}

export function PremiumGradientBackground({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <AnimatedGradient
      colors={['#EC4899', '#8B5CF6', '#10B981']} // Primary pink to purple to green
      className={className}
    >
      {children}
    </AnimatedGradient>
  );
}