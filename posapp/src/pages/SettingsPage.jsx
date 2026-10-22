import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { _t } from "../i18n";

const SETTINGS_ITEMS = [
  {
    icon: "bi-award",
    label: _t("Loyalty Program"),
    description: _t("Configure tiers, points and redemption rules"),
    to: "/posapp/loyalty-program",
  },
  {
    icon: "bi-people",
    label: _t("Users"),
    description: _t("Manage cashier accounts and permissions"),
    comingSoon: true,
  },
];

const SettingsPage = () => {
  const { t } = useTranslation();
  const { setTopbar } = useOutletContext();

  useEffect(() => {
    setTopbar({ title: t("Settings") });
  }, [setTopbar, t]);

  return (
    <div className="px-4 py-4">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {SETTINGS_ITEMS.map((item) =>
          item.comingSoon ? (
            <div
              key={item.label}
              className="pos-card"
              style={{ padding: 20, opacity: 0.5, cursor: "default" }}
              title={t("{{label}} — coming soon", { label: t(item.label) })}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: 22 }} />
              <div className="mt-2 fw-semibold">{t(item.label)}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t(item.description)}</div>
            </div>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className="pos-card"
              style={{ padding: 20, display: "block", textDecoration: "none", color: "inherit" }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: 22, color: "var(--color-primary)" }} />
              <div className="mt-2 fw-semibold">{t(item.label)}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t(item.description)}</div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
