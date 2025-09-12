import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = '@luna_theme_preference';

/**
 * Get the user's saved theme preference or system default
 */
export async function getStoredTheme(): Promise<Theme> {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme as Theme;
    }
    
    // No saved preference - return 'system' to use device preference
    return 'system';
  } catch (error) {
    console.error('Error loading theme preference:', error);
    return 'system'; // Fallback to system preference
  }
}

/**
 * Save the user's theme preference to device storage
 */
export async function saveTheme(theme: Theme): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}

/**
 * Clear the stored theme preference (resets to system default)
 */
export async function clearStoredTheme(): Promise<void> {
  try {
    await AsyncStorage.removeItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing theme preference:', error);
  }
}

/**
 * Get the resolved theme based on user preference and system settings
 */
export function getResolvedTheme(userTheme: Theme, systemTheme: 'light' | 'dark' | null): ResolvedTheme {
  if (userTheme === 'system') {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }
  return userTheme;
}

/**
 * Initialize theme based on stored preference or system default
 */
export async function initializeTheme(): Promise<{ theme: Theme; resolvedTheme: ResolvedTheme }> {
  const storedTheme = await getStoredTheme();
  const systemTheme = useColorScheme();
  
  let finalTheme: Theme;
  
  if (storedTheme === 'system') {
    // First time user - use system preference and save it as explicit choice
    finalTheme = systemTheme === 'dark' ? 'dark' : 'light';
    await saveTheme(finalTheme);
  } else {
    finalTheme = storedTheme;
  }
  
  const resolvedTheme = getResolvedTheme(finalTheme, systemTheme);
  
  return { theme: finalTheme, resolvedTheme };
}