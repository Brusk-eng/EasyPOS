import axios from "../api/config";
import db from "./db";
import useEngineSettingsStore from "./settingsStore";
import useConnectivityStore, { initConnectivity } from "./connectivity";
import { canServeLocally, readFromLocalDB } from "./localReads";
import { queueOfflineInvoice } from "./outbox";

// Middleware every api/*.js call routes through instead of calling axios
// directly. Decides server vs. local DB per call: reads whose exact call
// shape has a `localReads.js` adapter are eligible, and easy_pos.api.pos.
// create_invoice is queued locally instead (see outbox.js) — both only while
// the offline-mode feature is on (EasyPOS Settings) *and* connectivity is
// actually down (useConnectivityStore, not just a static flag).
// create_opening_entry/create_closing_entry are deliberately NOT queued —
// opening a shift resolves item stock/rate scoped to that POS Profile's own
// warehouse (easy_pos.api.sync.get_offline_snapshot), and a profile that was
// never synced online (or was synced under a different warehouse) would show
// wrong or missing stock offline with no way to re-resolve it without
// connectivity — so shift open/close stays online-only, same as
// createCustomer/createAddress/createContact and every other write. Going
// offline mid-shift falls back automatically, same as coming back online.
const WRITE_METHOD_MARKERS = [
	"client.insert",
	"client.save",
	"client.delete",
	"client.submit",
	"client.cancel",
	"pos.create_",
	"pos.cancel_",
];
const isWriteCall = (url) => WRITE_METHOD_MARKERS.some((marker) => url.includes(marker));

const isCreateInvoiceCall = (url) => url.includes("pos.create_invoice");

// Returns the same shape as axios.get/axios.post (a response object with
// `.data`), so callers keep using `response.data.message` unchanged.
const callServer = ({ url, method = "get", params, data }) =>
	axios.request({ url, method, params, data });

export const engineCall = ({ url, method = "get", params, data }) => {
	const { offlineModeEnabled } = useEngineSettingsStore.getState();
	const { isOnline } = useConnectivityStore.getState();

	if (offlineModeEnabled && !isOnline) {
		if (isCreateInvoiceCall(url)) {
			return queueOfflineInvoice(data || {});
		}
		if (!isWriteCall(url) && canServeLocally(url, { params, data })) {
			return readFromLocalDB({ url, params, data });
		}
	}

	return callServer({ url, method, params, data });
};

export const engineGet = (url, config = {}) =>
	engineCall({ url, method: "get", params: config.params });

export const enginePost = (url, data = {}) => engineCall({ url, method: "post", data });

// Opens the local Dexie database, loads the offline-mode flag from the
// backend, and starts connectivity tracking. Safe to call once at app boot;
// does not affect any existing page until the settings flag is actually on.
export const initEngine = async () => {
	await db.open();
	await useEngineSettingsStore.getState().loadSettings();
	initConnectivity();
};
