import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useLanguageStore from "../store/languageStore";
import { LANGUAGES } from "../i18n";
import { TextField, CheckboxField } from "../components/common";

const LoginPage = () => {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);

  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!usr || !pwd) {
      setFieldError(t("Username and password are required"));
      return;
    }
    setFieldError("");
    setSubmitting(true);

    const success = await login(usr, pwd);
    if (!success) {
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate("/posapp/terminal", { replace: true });
  };

  const displayError = fieldError || error;

  return (
    <div className="pos-login-shell">
      <div className="pos-login-card">
        {/* ── Brand panel ── */}
        <div className="pos-login-brand-panel">
          <div>
            <div className="pos-login-brand-header">
              <div className="pos-sidebar-logo" style={{ marginBottom: 0 }}>
                <i className="bi bi-display" />
              </div>
              <span>Easy POS</span>
            </div>

            <h1 className="pos-login-heading">
              {t("One counter.")}
              <br />
              {t("Every sale.")}
            </h1>
            <p className="pos-login-subheading">
              {t("Sign in to open your till and start ringing up sales.")}
            </p>

            <div className="pos-login-features">
              <div className="pos-login-feature">
                <i className="bi bi-lightning-charge-fill" />
                <span>{t("Checkout that keeps up during rush hour")}</span>
              </div>
              <div className="pos-login-feature">
                <i className="bi bi-receipt" />
                <span>{t("Every sale accounted for, down to the till")}</span>
              </div>
              <div className="pos-login-feature">
                <i className="bi bi-people-fill" />
                <span>{t("One login per cashier, one record per shift")}</span>
              </div>
            </div>
          </div>

          <p className="pos-login-footer">
            &copy; {new Date().getFullYear()} Easy POS. {t("Built for retail teams that never stop moving.")}
          </p>
        </div>

        {/* ── Form panel ── */}
        <div className="pos-login-form-panel">
          <div className="pos-login-form-inner">
            <div className="d-flex justify-content-end gap-2 mb-3" role="group" aria-label={t("Language")}>
              <i className="bi bi-translate" style={{ color: "var(--color-text-faint)" }} />
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className="pos-login-link"
                  style={lang.code === language ? { fontWeight: 600, textDecoration: "underline" } : undefined}
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <h2 className="pos-login-form-title">{t("Sign in")}</h2>
            <p className="pos-login-form-subtitle">
              {t("Enter your workstation credentials to start a shift.")}
            </p>

            {displayError && (
              <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label={t("Email or username")}
                placeholder="cashier@storefront.com"
                icon="bi-person"
                value={usr}
                onChange={setUsr}
                disabled={submitting}
                autoFocus
              />

              <TextField
                label={t("Password")}
                placeholder={t("Enter your password")}
                type={showPwd ? "text" : "password"}
                icon="bi-lock"
                trailingIcon={showPwd ? "bi-eye-slash" : "bi-eye"}
                trailingIconLabel={showPwd ? t("Hide password") : t("Show password")}
                onTrailingIconClick={() => setShowPwd((v) => !v)}
                value={pwd}
                onChange={setPwd}
                disabled={submitting}
              />

              <div className="pos-login-row">
                <CheckboxField
                  dense
                  label={t("Remember this device")}
                  checked={rememberDevice}
                  onChange={setRememberDevice}
                  className="pos-login-remember"
                />
                <button type="button" className="pos-login-link">
                  {t("Forgot password?")}
                </button>
              </div>

              <button
                type="submit"
                className="pos-btn pos-btn-primary w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    {t("Signing in…")}
                  </>
                ) : (
                  <>
                    {t("Sign in")} <i className="bi bi-arrow-right" />
                  </>
                )}
              </button>
            </form>

            <div className="pos-login-divider">
              <div className="pos-login-divider-line" />
              <span className="pos-login-divider-label">{t("New here")}</span>
              <div className="pos-login-divider-line" />
            </div>

            <button type="button" className="pos-btn pos-btn-secondary w-100">
              <i className="bi bi-person-plus" /> {t("Create an account")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
