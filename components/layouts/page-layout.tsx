import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

  const renderHeader = () => {
    if (!title && !showBackButton && !rightAction) return null;

    return (
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {headerStyle === 'glass' && (
          <>
            <LinearGradient
              colors={['rgba(31, 41, 55, 0.9)', 'rgba(17, 24, 39, 0.85)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.headerGlassBorder} />
          </>
        )}
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2} />
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
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      {/* <View style={[styles.content, { paddingBottom: 100 }]}> */}
      <View style={[styles.content]}>{children}</View>
    </View>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: object;
  className?: string;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.glassCard, style]}>
      <LinearGradient
        colors={['rgba(30, 30, 35, 0.95)', 'rgba(20, 20, 25, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glassCardBorder} />
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
    backgroundColor: '#0F0F0F',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
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
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerGlassBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  },
  glassCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassCardContent: {
    padding: 20,
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
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});

export default PageLayout;
