import React from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, StatusBarStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemedColors } from '@/lib/utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  headerStyle?: 'default' | 'transparent' | 'glass';
}

export function PageLayout({
  children,
  title,
  showBackButton = false,
  rightAction,
  headerStyle = 'default',
}: PageLayoutProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemedColors();

  const renderHeader = () => {
    if (!title && !showBackButton && !rightAction) return null;

    return (
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={28} color="#0D0D0D" strokeWidth={2} />
              </Pressable>
            )}
            {title && !showBackButton && (
              typeof title === 'string'
                ? <Text style={styles.headerTitle}>{title}</Text>
                : title
            )}
          </View>
          <View style={styles.headerCenter}>
            {title && showBackButton && (
              typeof title === 'string'
                ? <Text style={styles.headerTitle}>{title}</Text>
                : title
            )}
          </View>
          <View style={styles.headerRight}>{rightAction}</View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Liquid Glass Background */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View entering={FadeIn.duration(1000)} style={styles.orb1} />
      <Animated.View entering={FadeIn.duration(1200).delay(200)} style={styles.orb2} />
      <Animated.View entering={FadeIn.duration(1400).delay(400)} style={styles.orb3} />

      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: object;
  className?: string;
  colors?: ReturnType<typeof useThemedColors>;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.glassCard, style]}>
      <View style={styles.glassCardContent}>{children}</View>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  // Floating orbs for liquid glass effect
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -100,
    right: -100,
  },
  orb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    bottom: 100,
    left: -80,
  },
  orb3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    top: '40%',
    right: -50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerLeft: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0D0D',
    letterSpacing: -0.5,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  content: {
    flex: 1,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  glassCardContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0D0D',
    letterSpacing: -0.2,
  },
});

export default PageLayout;
