/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#f8f9fa',
    cardBorder: 'rgba(0,0,0,0.1)',
    positive: '#34C759',
    negative: '#FF3B30',
    secondaryText: '#687076',
    placeholderText: '#A1A1AA',
    border: '#E5E7EB',
    btnColor: "#11181C",
    btnText: "#000000",
    // New colors for charts and cards
    chartLine: '#0a7ea4',
    chartGrid: '#E5E7EB',
    chartBar: '#60A5FA',
    chartBarSecondary: '#93C5FD',
    cardHighlight: '#F0F9FF',
    cardShadow: 'rgba(0,0,0,0.05)',
    incomeText: '#059669',
    expenseText: '#DC2626',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1e2122',
    cardBorder: 'rgba(255,255,255,0.1)',
    positive: '#32D74B',
    negative: '#FF453A',
    secondaryText: '#9BA1A6',
    placeholderText: '#71717A',
    border: '#374151',
    btnColor: "#FFFFFF",
    btnText: "#11181C",
    // New colors for charts and cards
    chartLine: '#60A5FA',
    chartGrid: '#374151',
    chartBar: '#3B82F6',
    chartBarSecondary: '#60A5FA',
    cardHighlight: '#1E3A8A',
    cardShadow: 'rgba(0,0,0,0.2)',
    incomeText: '#34D399',
    expenseText: '#F87171',
  },
};
