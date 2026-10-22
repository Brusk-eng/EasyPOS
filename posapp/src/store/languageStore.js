import { create } from "zustand";
import i18n, { LANGUAGES, languageDir } from "../i18n";
import { loadDataTranslations } from "../i18n/dataTranslations";
import { applyBootstrapDirection } from "../theme/bootstrapDirection";

const STORAGE_KEY = "easy-pos-language";

// "hi-IN" / "hi" -> "hi" when we ship that catalog, else null.
const toSupported = (code) => {
	if (!code) return null;
	const base = String(code).toLowerCase().split(/[-_]/)[0];
	return LANGUAGES.some((l) => l.code === base) ? base : null;
};

const readStored = () => {
	try {
		return toSupported(localStorage.getItem(STORAGE_KEY));
	} catch {
		return null;
	}
};

// Returns a promise for the direction's Bootstrap stylesheet (main.jsx waits
// on the first one before mounting, so an RTL till never flashes LTR).
const applyLanguage = (language) => {
	const dir = languageDir(language);
	i18n.changeLanguage(language);
	document.documentElement.setAttribute("lang", language);
	document.documentElement.setAttribute("dir", dir);
	loadDataTranslations(language);
	return applyBootstrapDirection(dir);
};

// Device-scoped (localStorage), same as themeStore — the till's own setting.
// Until a cashier picks one here, it follows the Frappe user's language
// (window.pos_boot.lang, or the login response's `language`).
const useLanguageStore = create((set, get) => ({
	language: readStored() || toSupported(window.pos_boot?.lang) || "en",
	// true once the cashier explicitly chose a language on this device.
	chosen: !!readStored(),

	setLanguage: (language) => {
		const supported = toSupported(language) || "en";
		try {
			localStorage.setItem(STORAGE_KEY, supported);
		} catch {
			// private mode / blocked storage — still switch for this session
		}
		applyLanguage(supported);
		set({ language: supported, chosen: true });
	},

	// Applies the logged-in user's Frappe language, unless this device already
	// has an explicit choice.
	applyUserLanguage: (language) => {
		const supported = toSupported(language);
		if (get().chosen || !supported || supported === get().language) return;
		applyLanguage(supported);
		set({ language: supported });
	},
}));

export const languageReady = applyLanguage(useLanguageStore.getState().language);

// Record-value translations need a session — re-fetch once one exists (called
// after login / session check, see authStore).
export const refreshDataTranslations = () => loadDataTranslations(useLanguageStore.getState().language);

// Keeps other windows of this app on the same device (e.g. the Customer
// Display second screen) in step when the cashier switches language.
window.addEventListener("storage", (event) => {
	if (event.key !== STORAGE_KEY) return;
	const next = toSupported(event.newValue);
	if (!next || next === useLanguageStore.getState().language) return;
	applyLanguage(next);
	useLanguageStore.setState({ language: next, chosen: true });
});

export default useLanguageStore;
