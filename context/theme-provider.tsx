import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import {
  getStoredTheme,
  saveTheme,
  getResolvedTheme,
  type Theme,
  type ResolvedTheme,
} from '@/lib/utils/theme-storage';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light'); // Default to light theme
  const [isLoading, setIsLoading] = useState(true);

  // Calculate resolved theme
  const resolvedTheme: ResolvedTheme = getResolvedTheme(theme, systemTheme);
  const isDark = resolvedTheme === 'dark';

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await getStoredTheme();
        setThemeState(storedTheme);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to light theme as default
        setThemeState('light');
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference to storage
  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await saveTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
