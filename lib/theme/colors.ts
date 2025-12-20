/**
 * App Theme Colors
 *
 * Change PRIMARY to customize your app's accent color.
 * All other colors are derived from black, white, and the primary color.
 */

// ============================================
// PRIMARY COLOR - CHANGE THIS FOR YOUR APP
// ============================================
export const PRIMARY = '#0D9488'; // Teal - change to your brand color

// ============================================
// BASE COLORS (don't change these)
// ============================================
const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ============================================
// LIGHT THEME
// ============================================
export const lightColors = {
  // Primary
  primary: PRIMARY,
  primaryLight: `${PRIMARY}15`, // 15% opacity
  primaryMedium: `${PRIMARY}30`, // 30% opacity

  // Backgrounds
  background: WHITE,
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  // Text
  text: '#0D0D0D',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: WHITE,

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Cards & Surfaces
  card: WHITE,
  cardBorder: '#E5E7EB',

  // Inputs
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputText: '#0D0D0D',
  inputPlaceholder: '#9CA3AF',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: PRIMARY,

  // Danger (for delete actions)
  danger: '#EF4444',
  dangerBackground: '#FEE2E2',
  dangerText: '#DC2626',

  // Icons
  icon: '#6B7280',
  iconBackground: '#F3F4F6',

  // Modal
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: WHITE,

  // Tab Bar
  tabBar: '#F1F5F9', // Slate-100
  tabBarBorder: '#CBD5E1', // Slate-300
  tabBarActive: PRIMARY,
  tabBarInactive: '#64748B', // Slate-500

  // Shadows
  shadowColor: BLACK,
};

// ============================================
// DARK THEME
// ============================================
export const darkColors = {
  // Primary
  primary: PRIMARY,
  primaryLight: `${PRIMARY}20`, // 20% opacity
  primaryMedium: `${PRIMARY}40`, // 40% opacity

  // Backgrounds
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#262626',

  // Text
  text: WHITE,
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#0D0D0D',

  // Borders
  border: '#27272A',
  borderLight: '#3F3F46',

  // Cards & Surfaces
  card: '#1A1A1A',
  cardBorder: '#27272A',

  // Inputs
  inputBackground: '#1A1A1A',
  inputBorder: '#27272A',
  inputText: WHITE,
  inputPlaceholder: '#71717A',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: PRIMARY,

  // Danger (for delete actions)
  danger: '#EF4444',
  dangerBackground: '#450A0A',
  dangerText: '#FCA5A5',

  // Icons
  icon: '#A1A1AA',
  iconBackground: '#27272A',

  // Modal
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: '#1A1A1A',

  // Tab Bar
  tabBar: 'rgba(13, 13, 13, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  tabBarActive: PRIMARY,
  tabBarInactive: '#71717A',

  // Shadows
  shadowColor: BLACK,
};

export type ThemeColors = typeof lightColors;
