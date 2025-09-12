import React, { useEffect, useRef } from 'react';
import { View, Animated, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CosmicGradientProps {
  colors: string[];
  children?: React.ReactNode;
  className?: string;
  style?: any;
  theme?: 'nutrition' | 'exercise' | 'cycle';
  glass?: boolean; // <- optional: enable the translucent/glass vibe
  animate?: boolean; // <- optional: enable subtle breathing
}

export function CosmicGradient({
  colors,
  children,
  className = '',
  style,
  theme = 'nutrition',
  glass = false,
  animate = false,
}: CosmicGradientProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true, // only animating opacity/transform
      })
    );
    animation.start();
    return () => animation.stop();
  }, [animate, animatedValue]);

  // Subtle scale animation (disabled by default)
  const scale = animate
    ? animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.01, 1],
      })
    : 1;

  // Opaque by default. If glass=true, add a tiny pulse.
  const opacity = glass
    ? animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.92, 0.97, 0.92],
      })
    : 1;

  return (
    <View className={`overflow-hidden ${className}`} style={style}>
      {/* Main opaque cosmic gradient background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ scale }],
          opacity,
        }}
      >
        <LinearGradient
          colors={colors as [ColorValue, ColorValue, ...ColorValue[]]}
          locations={[0, 0.25, 1]} // longer in the darkest stop
          start={{ x: 0.1, y: 0.0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Optional overlay: OFF by default (no transparency).
          If glass=true, bring back a very light translucent sheen. */}
      {glass && (
        <LinearGradient
          colors={[
            addAlpha(colors[0], 0.18),
            addAlpha(mix(colors[0], colors[colors.length - 1], 0.5), 0.08),
            addAlpha(colors[colors.length - 1], 0.18),
          ]}
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
      )}

      {/* Content */}
      <View className="relative z-10">{children}</View>
    </View>
  );
}

/** Helpers: add alpha to #RRGGBB and mix two hex colors */
function addAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${a}` : hex; // expects #RRGGBB
}

function mix(hex1: string, hex2: string, t: number): string {
  const c1 = parseInt(hex1.slice(1), 16);
  const c2 = parseInt(hex2.slice(1), 16);
  const r = Math.round((c1 >> 16) * (1 - t) + (c2 >> 16) * t);
  const g = Math.round(((c1 >> 8) & 0xff) * (1 - t) + ((c2 >> 8) & 0xff) * t);
  const b = Math.round((c1 & 0xff) * (1 - t) + (c2 & 0xff) * t);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/* Darker, fully-opaque gradients */
export function getNutritionCosmicGradient(isDark: boolean): string[] {
  return isDark
    ? ['#040806', '#09120C', '#0E1A12'] // near-black forest
    : ['#e6fffa', '#b3f5ec', '#10b981'];
}
export function getExerciseCosmicGradient(isDark: boolean): string[] {
  return isDark
    ? ['#05040A', '#0D0B16', '#151326'] // near-black violet
    : ['#f0e6ff', '#ddd6fe', '#6e4787'];
}
export function getCycleCosmicGradient(isDark: boolean): string[] {
  return isDark
    ? ['#0A0507', '#140A10', '#1E1420'] // near-black rose
    : ['#fef7ff', '#fce7f3', '#da76a4'];
}
