import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Gauge, Candy, Wheat, Flame, HeartPulse, Factory, Info } from 'lucide-react-native';
import { GlassBottomSheet, GlassBottomSheetRef } from '@/components/ui/glass-bottom-sheet';

export type TabType = 'all' | 'saves';

interface HomeHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

// Grid/All icon
function AllIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
    </Svg>
  );
}

// Bookmark/Saves icon
function SavesIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

// Search icon
function SearchIcon({ color = '#6B7280', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.35-4.35" />
    </Svg>
  );
}

// X/Close icon
function CloseIcon({ color = '#6B7280', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

// Indicator legend configuration with descriptions
const INDICATOR_CONFIG = [
  {
    key: 'gi',
    Icon: Gauge,
    labelKey: 'nutrition.glycemicIndex',
    descKey: 'nutrition.descriptions.gi',
  },
  {
    key: 'sugar',
    Icon: Candy,
    labelKey: 'nutrition.sugarContent',
    descKey: 'nutrition.descriptions.sugar',
  },
  {
    key: 'fiber',
    Icon: Wheat,
    labelKey: 'nutrition.fiberContent',
    descKey: 'nutrition.descriptions.fiber',
  },
  {
    key: 'inflammation',
    Icon: Flame,
    labelKey: 'nutrition.inflammatoryScore',
    descKey: 'nutrition.descriptions.inflammation',
  },
  {
    key: 'hormone',
    Icon: HeartPulse,
    labelKey: 'nutrition.hormoneImpact',
    descKey: 'nutrition.descriptions.hormone',
  },
  {
    key: 'processed',
    Icon: Factory,
    labelKey: 'nutrition.processedLevel',
    descKey: 'nutrition.descriptions.processed',
  },
] as const;

// Color guide data
const COLOR_GUIDE = [
  { color: '#059669', labelKey: 'nutrition.colorGood' },
  { color: '#D97706', labelKey: 'nutrition.colorModerate' },
  { color: '#DC2626', labelKey: 'nutrition.colorPoor' },
] as const;

// Indicator Legend Content (for bottom sheet)
function IndicatorLegendContent() {
  const { t } = useTranslation();

  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>{t('nutrition.legendTitle')}</Text>

      <View style={styles.legendItems}>
        {INDICATOR_CONFIG.map(({ key, Icon, labelKey, descKey }) => (
          <View key={key} style={styles.legendItem}>
            <View style={styles.legendIconBadge}>
              <Icon size={18} color="#9CA3AF" strokeWidth={2} />
            </View>
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>{t(labelKey)}</Text>
              <Text style={styles.legendDescription}>{t(descKey)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.legendColorGuide}>
        <Text style={styles.legendSubtitle}>{t('nutrition.colorGuide')}</Text>
        <View style={styles.colorChips}>
          {COLOR_GUIDE.map(({ color, labelKey }) => (
            <View key={color} style={[styles.colorChip, { backgroundColor: `${color}15` }]}>
              <View style={[styles.colorDot, { backgroundColor: color }]} />
              <Text style={[styles.colorChipLabel, { color }]}>{t(labelKey)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function HomeHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const legendSheetRef = useRef<GlassBottomSheetRef>(null);
  const { t } = useTranslation();

  const toggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSearchOpen) {
      onSearchChange('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const openLegend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    legendSheetRef.current?.expand();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Pressable onPress={openLegend} style={styles.infoButton} hitSlop={8}>
            <Info size={16} color="#9CA3AF" strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          {/* Search Button */}
          <Pressable onPress={toggleSearch} style={styles.iconButton}>
            <View style={[styles.iconButtonInner, isSearchOpen && styles.iconButtonActive]}>
              {isSearchOpen ? (
                <CloseIcon color="#0D9488" size={18} />
              ) : (
                <SearchIcon color="#6B7280" size={18} />
              )}
            </View>
          </Pressable>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <View style={styles.tabsWrapper}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTabChange('all');
                }}
                style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
              >
                <AllIcon color={activeTab === 'all' ? '#0D9488' : '#6B7280'} />
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTabChange('saves');
                }}
                style={[styles.tabButton, activeTab === 'saves' && styles.tabButtonActive]}
              >
                <SavesIcon color={activeTab === 'saves' ? '#0D9488' : '#6B7280'} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.searchContainer}
        >
          <View style={styles.searchWrapper}>
            <SearchIcon color="#9CA3AF" size={18} />
            <TextInput
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={onSearchChange}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => onSearchChange('')} hitSlop={10}>
                <CloseIcon color="#9CA3AF" size={16} />
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}

      {/* Legend Bottom Sheet */}
      <GlassBottomSheet ref={legendSheetRef} snapPoints={['62%']} hideTabBar={false}>
        <IndicatorLegendContent />
      </GlassBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 2,
  },
  iconButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconButtonActive: {
    backgroundColor: 'rgba(209, 250, 244, 0.9)',
    borderColor: 'rgba(20, 184, 166, 0.4)',
    shadowOpacity: 0.15,
  },
  tabSwitcher: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabsWrapper: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    marginTop: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoButton: {
    padding: 4,
  },
  // Bottom sheet legend styles (light theme)
  legendContainer: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  legendTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendTextContainer: {
    flex: 1,
    gap: 2,
  },
  legendLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  legendDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 17,
  },
  legendColorGuide: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  legendSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
  },
  colorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  colorChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
