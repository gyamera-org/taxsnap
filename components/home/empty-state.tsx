import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  type: 'all' | 'saves' | 'search';
  searchQuery?: string;
}

// Camera/Scan icon for "No Scans"
function ScanEmptyIcon({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

// Bookmark icon for "No Saves"
function SavesEmptyIcon({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

// Search icon for "No Results"
function SearchEmptyIcon({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.35-4.35" />
    </Svg>
  );
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
  const { t } = useTranslation();

  const getContent = () => {
    switch (type) {
      case 'saves':
        return {
          icon: <SavesEmptyIcon />,
          title: t('home.empty.saves.title'),
          description: t('home.empty.saves.description'),
        };
      case 'search':
        return {
          icon: <SearchEmptyIcon />,
          title: t('home.empty.search.title'),
          description: t('home.empty.search.description'),
        };
      case 'all':
      default:
        return {
          icon: <ScanEmptyIcon />,
          title: t('home.empty.all.title'),
          description: t('home.empty.all.description'),
        };
    }
  };

  const content = getContent();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <View style={styles.glassCard}>
        <View style={styles.iconContainer}>
          {content.icon}
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  glassCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
