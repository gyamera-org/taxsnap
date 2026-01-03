import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_DATA_KEY = '@taxsnap_onboarding_data';
const USER_NAME_KEY = '@taxsnap_user_name';

export interface OnboardingData {
  income: string | null;
  workType: string | null;
  currentTracking: string | null;
  monthlyExpenses: string | null;
  estimatedSavings: number;
  estimatedMissedDeductions: number;
  completedAt: string;
}

/**
 * Save onboarding quiz data
 */
export async function saveOnboardingData(data: OnboardingData): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving onboarding data:', error);
  }
}

/**
 * Get saved onboarding data
 */
export async function getOnboardingData(): Promise<OnboardingData | null> {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return null;
  }
}

/**
 * Save user's name from onboarding
 */
export async function saveUserName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
  } catch (error) {
    console.error('Error saving user name:', error);
  }
}

/**
 * Get saved user name
 */
export async function getUserName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(USER_NAME_KEY);
  } catch (error) {
    console.error('Error getting user name:', error);
    return null;
  }
}

/**
 * Clear all onboarding data
 */
export async function clearOnboardingData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ONBOARDING_DATA_KEY, USER_NAME_KEY]);
  } catch (error) {
    console.error('Error clearing onboarding data:', error);
  }
}
