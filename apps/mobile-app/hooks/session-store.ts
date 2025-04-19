import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Cookies from "js-cookie";

const key = "session_token";

const nativeImplementation = {
	getToken: async () => await SecureStore.getItemAsync(key),
	deleteToken: () => SecureStore.deleteItemAsync(key),
	setToken: (v: string) => SecureStore.setItemAsync(key, v),
};

const webImplementation = {
	getToken: () => Promise.resolve(Cookies.get(key) ?? null),
	deleteToken: () => {
		Cookies.remove(key);
		return Promise.resolve();
	},
	setToken: (v: string) => {
		Cookies.set(key, v, {
			expires: 365, // 1 year
			secure: true,
			sameSite: "lax",
			domain: window.location.hostname,
			path: "/"
		});
		return Promise.resolve();
	},
};

export const { getToken, deleteToken, setToken } = Platform.select({
	web: webImplementation,
	default: nativeImplementation,
});
