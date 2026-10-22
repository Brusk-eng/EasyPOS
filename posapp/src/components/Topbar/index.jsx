import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import usePOSSessionStore from "../../store/posSessionStore";
import useThemeStore from "../../store/themeStore";
import useLanguageStore from "../../store/languageStore";
import { LANGUAGES, tLabel } from "../../i18n";
import useConnectivityStore from "../../engine/connectivity";
import useEngineSettingsStore from "../../engine/settingsStore";
import ClosingModal from "../Closing";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

const Topbar = ({ title, searchValue, onSearchChange, searchPlaceholder, onScanClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const openingDetail = usePOSSessionStore((s) => s.openingDetail);
  const hasOpeningEntry = usePOSSessionStore((s) => s.hasOpeningEntry);
  const fullName = useAuthStore((s) => s.user?.full_name);
  const email = useAuthStore((s) => s.user?.email);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const offlineModeEnabled = useEngineSettingsStore((s) => s.offlineModeEnabled);
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const [showClosingModal, setShowClosingModal] = useState(false);

  const handleLogout = () => {
    logout().then(() => navigate("/posapp/login", { replace: true }));
  };

  return (
    <>
      <div className="pos-topbar">
        <div className="d-flex align-items-center gap-3">
          <span className="pos-topbar-title">{tLabel(t, title)}</span>
          {onSearchChange && (
            <div className={onScanClick ? "pos-search has-scan" : "pos-search"}>
              <i className="bi bi-search" />
              <input
                type="text"
                className={onScanClick ? "has-scan-btn" : ""}
                placeholder={searchPlaceholder ? t(searchPlaceholder) : t("Search...")}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {onScanClick && (
                <button
                  type="button"
                  className="pos-search-scan-btn"
                  title={t("Scan with camera")}
                  aria-label={t("Scan with camera")}
                  onClick={onScanClick}
                >
                  <i className="bi bi-upc-scan" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="d-flex align-items-center gap-3">
          {offlineModeEnabled && (
            <div
              className="pos-status-pill"
              title={isOnline ? t("Connected to the server") : t("No connection — working from cached data")}
              style={
                isOnline
                  ? { background: "var(--color-success-bg)", color: "var(--color-success-text)" }
                  : { background: "var(--color-danger-bg)", color: "var(--color-danger-text)" }
              }
            >
              <span
                className="dot"
                style={{ background: isOnline ? "var(--color-success-icon)" : "var(--color-danger-text)" }}
              />
              {isOnline ? t("Online") : t("Offline")}
            </div>
          )}

          {hasOpeningEntry ? (
            <div className="pos-status-pill success">
              <span className="dot" />
              {openingDetail?.pos_profile}
            </div>
          ) : (
            <div className="pos-status-pill" style={{ background: "var(--color-warning-bg)", color: "var(--color-warning-text)" }}>
              <span className="dot" style={{ background: "var(--color-warning-text-strong)" }} />
              {t("No shift open")}
            </div>
          )}

          {hasOpeningEntry && (
            <button
              type="button"
              className="pos-btn pos-btn-secondary"
              style={{ height: 30, fontSize: 12, padding: "0 12px" }}
              onClick={() => setShowClosingModal(true)}
              disabled={offlineModeEnabled && !isOnline}
              title={offlineModeEnabled && !isOnline ? t("Reconnect to close your shift") : undefined}
            >
              {t("Close shift")}
            </button>
          )}

          <div className="position-relative">
            <button
              type="button"
              className="pos-icon-btn"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title={t("Language")}
              aria-label={t("Language")}
            >
              <i className="bi bi-translate" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end pos-user-menu">
              {LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    className={`dropdown-item pos-user-menu-item${lang.code === language ? " active" : ""}`}
                    onClick={() => setLanguage(lang.code)}
                  >
                    <i className={`bi ${lang.code === language ? "bi-check2" : "bi-dot"}`} />
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="pos-icon-btn"
            title={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
            aria-label={t("Toggle dark mode")}
            onClick={toggleTheme}
          >
            <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`} />
          </button>

          <div className="position-relative">
            <button
              type="button"
              className="pos-user-trigger border-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="pos-avatar pos-avatar-active">{getInitials(fullName)}</span>
              <i className="bi bi-chevron-down pos-user-trigger-caret" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end pos-user-menu">
              <li className="pos-user-menu-header">
                <span className="pos-avatar pos-avatar-active pos-user-menu-avatar">{getInitials(fullName)}</span>
                <div className="pos-user-menu-identity">
                  <div className="pos-user-menu-name">{fullName || t("User")}</div>
                  {email && <div className="pos-user-menu-email">{email}</div>}
                </div>
              </li>
              <li>
                <hr className="pos-user-menu-divider" />
              </li>
              <li>
                <button className="dropdown-item pos-user-menu-item pos-user-menu-item-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" />
                  {t("Log out")}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showClosingModal && (
        <ClosingModal onClose={() => setShowClosingModal(false)} onConfirm={() => setShowClosingModal(false)} />
      )}
    </>
  );
};

export default Topbar;
