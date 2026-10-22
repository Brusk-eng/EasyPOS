import i18n from "./index";
import { engineGet } from "../engine";

const cacheKey = (language) => `easy-pos-data-i18n-${language}`;

const readCache = (language) => {
	try {
		return JSON.parse(localStorage.getItem(cacheKey(language)) || "null");
	} catch {
		return null;
	}
};

const writeCache = (language, translations) => {
	try {
		localStorage.setItem(cacheKey(language), JSON.stringify(translations));
	} catch {
		// storage full/blocked — the in-memory bundle still applies this session
	}
};

// Loads record-value translations (easy_pos.api.language.get_data_translations)
// into the "data" namespace for `language`. The last fetched set is cached per
// device so a reload while offline still shows translated names. Silently a
// no-op before login (the endpoint needs a session) or for English.
export const loadDataTranslations = async (language) => {
	if (!language || language === "en") return;
	const cached = readCache(language);
	if (cached) i18n.addResourceBundle(language, "data", cached, true, true);
	try {
		const response = await engineGet("/api/method/easy_pos.api.language.get_data_translations", {
			params: { language },
		});
		const translations = response.data.message || {};
		i18n.addResourceBundle(language, "data", translations, true, true);
		writeCache(language, translations);
	} catch {
		// guest / offline — keep whatever the cache provided
	}
};
