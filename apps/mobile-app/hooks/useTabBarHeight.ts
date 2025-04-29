import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTabBarHeight() {
	const { bottom } = useSafeAreaInsets();
	// Standard tab bar height on iOS is 49pt
	const TAB_BAR_HEIGHT = 49;

	return Platform.select({
		ios: TAB_BAR_HEIGHT + bottom,
		default: TAB_BAR_HEIGHT,
	});
}