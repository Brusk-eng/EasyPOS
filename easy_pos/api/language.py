import frappe
from frappe.translate import get_all_languages, get_all_translations

# Sent by the POS frontend on every request (posapp/src/api/config.js) with the
# language chosen on that device (posapp/src/store/languageStore.js).
LANGUAGE_HEADER = "X-Easy-POS-Language"

# Master-data doctypes whose record *names* show up as labels in the POS
# (payment rows, category chips, filters). Their names are resolved through
# Frappe's own translations, so ERPNext's shipped ones (e.g. "Cash") work out
# of the box and anything else can be added as a Translation record in desk.
NAME_DOCTYPES = ("Mode of Payment", "Item Group", "Customer Group", "Territory", "Item Attribute")


def _supported(language: str | None) -> str | None:
	language = (language or "").strip().lower()
	return language if language and language in get_all_languages() else None


def apply_request_language() -> None:
	"""before_request hook: makes frappe.throw/_() messages come back in the
	language the cashier picked on this device, rather than only ever in the
	Frappe User's own language setting. A header (not a `_lang` form param) so
	it never reaches whitelisted methods that accept **kwargs."""
	language = _supported(frappe.get_request_header(LANGUAGE_HEADER))
	if language:
		frappe.local.lang = language


@frappe.whitelist()
def get_data_translations(language: str) -> dict:
	"""{source: translated} for data values the POS displays (item names,
	payment modes, item groups, attribute values...) in `language`:

	- every Translation record for that language — the desk-managed way to
	  translate any record value (Item names, Warehouse names, ...), and
	- the names of NAME_DOCTYPES records that Frappe/ERPNext's own app
	  translations already cover.

	Merged client-side into a separate i18n namespace (src/i18n's "data"),
	so UI strings and record values never collide."""
	language = _supported(language)
	if not language or language == "en":
		return {}

	translations = {
		row.source_text: row.translated_text
		for row in frappe.get_all(
			"Translation",
			filters={"language": language},
			fields=["source_text", "translated_text"],
		)
		if row.source_text and row.translated_text
	}

	app_translations = get_all_translations(language)
	names = set()
	for doctype in NAME_DOCTYPES:
		names.update(frappe.get_all(doctype, pluck="name"))
	names.update(frappe.get_all("Item Attribute Value", pluck="attribute_value", distinct=True))
	for name in names:
		if name and name not in translations and app_translations.get(name):
			translations[name] = app_translations[name]

	return translations
