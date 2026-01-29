import { profileConfig as defaultConfig } from "./config";
import { ProfileConfig } from "./types";
import { fetchConfig } from "./api";

let authState = false;
let adminToken: string | null = null;

export const isAuthenticated = () => typeof window !== "undefined" && authState;

export const getAdminToken = () => (typeof window === "undefined" ? null : adminToken || sessionStorage.getItem("adminToken"));

const getCurrentConfig = async (): Promise<ProfileConfig> => {
	if (typeof window === "undefined") return defaultConfig;

	try {
		const apiConfig = await fetchConfig();
		if (apiConfig && apiConfig.admin && apiConfig.user) {
			return apiConfig;
		}
	} catch (error) {
		console.error("Error fetching config from API:", error);
	}

	return defaultConfig;
};

export const login = async (username: string, password: string): Promise<boolean> => {
	const currentConfig = await getCurrentConfig();
	// Lấy credentials từ Redis (nếu có), nếu không thì dùng default
	const { username: adminUsername, password: adminPassword } = currentConfig.admin || { username: "admin", password: "admin" };

	if (username === adminUsername && password === adminPassword) {
		authState = true;
		const token = btoa(`${username}:${password}:${Date.now()}`);
		adminToken = token;
		if (typeof window !== "undefined") {
			sessionStorage.setItem("adminLoggedIn", "true");
			sessionStorage.setItem("adminToken", token);
		}

		// Log the login event
		try {
			await fetch("/api/logs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "login",
					username: username,
				}),
			});
		} catch (error) {
			console.error("Error logging login event:", error);
			// Don't block login if logging fails
		}

		return true;
	}
	return false;
};

export const logout = () => {
	authState = false;
	adminToken = null;
	if (typeof window !== "undefined") {
		sessionStorage.removeItem("adminLoggedIn");
		sessionStorage.removeItem("adminToken");
	}
};

export const initAuth = () => {
	if (typeof window !== "undefined") {
		const sessionAuth = sessionStorage.getItem("adminLoggedIn");
		authState = sessionAuth === "true";
		adminToken = sessionStorage.getItem("adminToken");
	}
};

export const updateToken = (username: string, password: string) => {
	if (typeof window === "undefined") return;

	authState = true;
	const token = btoa(`${username}:${password}:${Date.now()}`);
	adminToken = token;
	sessionStorage.setItem("adminLoggedIn", "true");
	sessionStorage.setItem("adminToken", token);
};
