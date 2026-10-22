import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/format";

// currencyFormat ({ symbol, number_format, symbol_on_right }) comes from the
// Terminal's broadcast snapshot (hooks/useCustomerDisplayBroadcaster.js).
const formatAmount = (value, currencyFormat, precision) => formatCurrency(value ?? 0, currencyFormat, precision);

const PaymentView = ({ grandTotal, currencyFormat, precision }) => {
  const { t } = useTranslation();
  return (
    <div className="customer-display-screen customer-display-payment">
      <i className="bi bi-credit-card-2-front" style={{ fontSize: 64, color: "var(--color-primary)" }} />
      <h2 className="mt-4">{t("Please Pay")}</h2>
      <div className="customer-display-payment-amount">{formatAmount(grandTotal, currencyFormat, precision)}</div>
    </div>
  );
};

export default PaymentView;
