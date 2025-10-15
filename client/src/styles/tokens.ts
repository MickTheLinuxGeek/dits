/**
 * Design Tokens
 * Core design system values for colors, spacing, typography, etc.
 */

// Color Palette - Base Colors
export const colors = {
  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Primary Brand Color (Blue)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },

  // Success (Green)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning (Yellow)
  warning: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Error (Red)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info (Cyan)
  info: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Semantic Color Tokens for Light Theme
export const lightTheme = {
  // Background colors
  bg: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    hover: colors.gray[100],
    active: colors.gray[200],
    disabled: colors.gray[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    disabled: colors.gray[400],
    inverse: colors.white,
    link: colors.primary[600],
    linkHover: colors.primary[700],
  },

  // Border colors
  border: {
    primary: colors.gray[300],
    secondary: colors.gray[200],
    hover: colors.gray[400],
    focus: colors.primary[500],
    error: colors.error[500],
  },

  // Semantic UI colors
  semantic: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    primaryActive: colors.primary[800],
    success: colors.success[600],
    successHover: colors.success[700],
    warning: colors.warning[600],
    warningHover: colors.warning[700],
    error: colors.error[600],
    errorHover: colors.error[700],
    info: colors.info[600],
    infoHover: colors.info[700],
  },

  // Shadow colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
} as const;

// Semantic Color Tokens for Dark Theme
export const darkTheme = {
  // Background colors
  bg: {
    primary: colors.gray[950],
    secondary: colors.gray[900],
    tertiary: colors.gray[800],
    hover: colors.gray[800],
    active: colors.gray[700],
    disabled: colors.gray[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Text colors
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    disabled: colors.gray[600],
    inverse: colors.gray[900],
    link: colors.primary[400],
    linkHover: colors.primary[300],
  },

  // Border colors
  border: {
    primary: colors.gray[700],
    secondary: colors.gray[800],
    hover: colors.gray[600],
    focus: colors.primary[500],
    error: colors.error[500],
  },

  // Semantic UI colors
  semantic: {
    primary: colors.primary[500],
    primaryHover: colors.primary[400],
    primaryActive: colors.primary[300],
    success: colors.success[500],
    successHover: colors.success[400],
    warning: colors.warning[500],
    warningHover: colors.warning[400],
    error: colors.error[500],
    errorHover: colors.error[400],
    info: colors.info[500],
    infoHover: colors.info[400],
  },

  // Shadow colors (darker shadows for dark theme)
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
  },
} as const;

// Export theme type
export type Theme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark';

// Helper function to get theme
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
