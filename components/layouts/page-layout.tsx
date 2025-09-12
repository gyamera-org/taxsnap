import { View, Image, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import WeeklyCalendar from '@/components/nutrition/weekly-calendar';
import { NavigableAvatar } from '@/components/ui/avatar';
import { NavigationErrorBoundary } from '@/components/ui/navigation-error-boundary';
import { useTheme } from '@/context/theme-provider';
import { CosmicBackground } from '@/components/ui/cosmic-background';
import { PeriodLog } from '@/lib/utils/cycle-utils';

interface Props {
  children: React.ReactNode;
  title: string;
  extraSubtitle?: string;
  image?: string;
  btn?: React.ReactNode;
  theme?: 'nutrition' | 'cycle' | 'exercise' | 'settings' | 'progress';
  // Calendar props - only required when theme is not 'settings'
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  loggedDates?: string[];
  periodLogs?: PeriodLog[];
  cycleSettings?: { cycle_length?: number; period_length?: number } | null;
}

const PageLayout = ({
  children,
  title,
  extraSubtitle,
  image,
  btn,
  theme = 'settings',
  selectedDate,
  onDateSelect,
  loggedDates,
  periodLogs,
  cycleSettings,
}: Props) => {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const { isDark } = useTheme();
  
  // Removed gradient colors logic - now handled by CosmicBackground
  const shouldShowCalendar =
    theme !== 'settings' && 
    theme !== 'progress' && 
    selectedDate && 
    !isNaN(selectedDate.getTime()) && 
    onDateSelect;

  return (
    <CosmicBackground theme={theme} isDark={isDark}>
      <View className="flex-1 pt-5">
      <View 
        className={`flex-row items-center justify-between pb-4 pt-12 ${isTablet ? 'px-8' : 'px-4'}`}
        style={isTablet ? { maxWidth: 1024, marginHorizontal: 'auto', width: '100%' } : undefined}
      >
        <View className="flex-row items-center flex-1">
          {theme !== 'settings' && (
            <NavigationErrorBoundary size={isTablet ? 56 : 48}>
              <NavigableAvatar size={isTablet ? 56 : 48} />
            </NavigationErrorBoundary>
          )}
          <View className={theme !== 'settings' ? 'ml-3 flex-1' : 'flex-1'}>
            <Text className={`${isTablet ? 'text-4xl' : 'text-3xl'} font-bold ${isDark ? 'text-white' : 'text-black'}`}>{title}</Text>
            {extraSubtitle && (
              <Text className={`${isTablet ? 'text-base' : 'text-sm'} ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {extraSubtitle}
              </Text>
            )}
          </View>
        </View>
        {image && (
          <Image
            source={require('@/assets/images/avatar.png')}
            className={`${isTablet ? 'w-16 h-16' : 'w-14 h-14'} rounded-full mr-4`}
          />
        )}
        {btn}
      </View>

      {/* Only show WeeklyCalendar for non-settings themes */}
      {shouldShowCalendar && (
        <NavigationErrorBoundary fallback={<View />}>
          <View style={isTablet ? { maxWidth: 1024, marginHorizontal: 'auto', width: '100%' } : undefined}>
            <WeeklyCalendar
              selectedDate={selectedDate!}
              onDateSelect={onDateSelect!}
              loggedDates={loggedDates || []}
              theme={theme}
              periodLogs={periodLogs}
              cycleSettings={cycleSettings}
            />
          </View>
        </NavigationErrorBoundary>
      )}

      <View style={isTablet ? { maxWidth: 1024, marginHorizontal: 'auto', width: '100%', flex: 1 } : { flex: 1 }}>
        {children}
      </View>
      </View>
    </CosmicBackground>
  );
};

export default PageLayout;
