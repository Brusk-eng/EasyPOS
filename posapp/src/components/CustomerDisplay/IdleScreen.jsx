import { useTranslation } from "react-i18next";

const IdleScreen = () => {
  const { t } = useTranslation();
  return (
    <div className="customer-display-screen customer-display-idle">
      <i className="bi bi-shop" style={{ fontSize: 72, color: "var(--color-primary)" }} />
      <h1 className="mt-4">{t("Welcome")}</h1>
      <p className="text-muted">{t("Your order will appear here shortly.")}</p>
    </div>
  );
};

export default IdleScreen;
