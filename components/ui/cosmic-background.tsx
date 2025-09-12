import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CosmicBackgroundProps {
  children?: React.ReactNode;
  theme?: 'nutrition' | 'cycle' | 'exercise' | 'settings' | 'progress';
  isDark?: boolean;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  animationDelay: number;
}

export function CosmicBackground({ children, theme = 'settings', isDark = true }: CosmicBackgroundProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const starsRef = useRef<Star[]>([]);

  // Generate stars only once
  useEffect(() => {
    if (starsRef.current.length === 0) {
      const stars: Star[] = [];
      const starCount = isDark ? 150 : 30; // Much more stars in dark mode
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          id: i,
          x: Math.random() * screenWidth,
          y: Math.random() * screenHeight,
          size: Math.random() * 2 + 0.5, // Size between 0.5-2.5 (more variety)
          opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
          animationDelay: Math.random() * 3000, // Stagger animations
        });
      }
      
      starsRef.current = stars;
    }
  }, [screenWidth, screenHeight, isDark]);

  // Animate stars
  useEffect(() => {
    const animations = starsRef.current.map((star) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(star.animationDelay),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: 2000 + Math.random() * 2000, // 2-4 seconds
            useNativeDriver: false,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.8 + 0.4,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
        ])
      );
    });

    // Start all animations
    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  // Get cosmic gradient colors
  const getCosmicGradient = () => {
    if (isDark) {
      switch (theme) {
        case 'nutrition':
          return ['#0a0f0a', '#1a2e1a', '#2d4a2d']; // Deep cosmic green
        case 'cycle':
          return ['#0f0a14', '#2e1a2b', '#4a2d42']; // Deep cosmic pink
        case 'exercise':
          return ['#0f0a1c', '#2e1a32', '#4a2d47']; // Deep cosmic purple
        case 'settings':
        case 'progress':
        default:
          return ['#0a0a0f', '#1a1a2e', '#2d2d4a']; // Much deeper space
      }
    } else {
      switch (theme) {
        case 'nutrition':
          return ['#e6fffa', '#b3f5ec', '#10b981']; // Light cosmic green
        case 'cycle':
          return ['#fef7ff', '#fce7f3', '#da76a4']; // Light cosmic pink
        case 'exercise':
          return ['#f0e6ff', '#ddd6fe', '#6e4787']; // Light cosmic purple
        case 'settings':
        case 'progress':
        default:
          return ['#f1f5f9', '#e2e8f0', '#cbd5e1']; // Light space
      }
    }
  };

  const gradientColors = getCosmicGradient();

  return (
    <View style={{ flex: 1 }}>
      {/* Cosmic gradient background */}
      <LinearGradient
        colors={gradientColors}
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
      
      {/* Stars overlay - visible in both dark and light modes */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {starsRef.current.map((star) => (
          <Animated.View
            key={star.id}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              backgroundColor: isDark ? '#ffffff' : '#4a5568', // White stars in dark, dark gray stars in light
              borderRadius: star.size / 2,
              opacity: star.opacity,
              shadowColor: isDark ? '#ffffff' : '#2d3748',
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: star.size,
              shadowOpacity: isDark ? 0.5 : 0.3, // Less glow in light mode
            }}
          />
        ))}
      </View>
      
      {/* Content overlay */}
      <View style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        {children}
      </View>
    </View>
  );
}