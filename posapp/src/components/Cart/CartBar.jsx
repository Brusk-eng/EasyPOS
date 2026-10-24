import usePOSSessionStore from "../../store/posSessionStore";
import useCartStore from "../../store/cartStore";
import useCartTotals from "../../hooks/useCartTotals";

// Phone-only summary strip under the item grid: keeps the running total in
// view while browsing and opens the cart sheet (see POSTerminalPage).
const CartBar = ({ onOpen }) => {
  const currencySymbol = usePOSSessionStore((s) => s.currencySymbol);
  const currencyPrecision = usePOSSessionStore((s) => s.currencyPrecision);
  const itemCount = useCartStore((s) => s.items.length);
  const { grandTotal } = useCartTotals();

  const total = `${currencySymbol}${(grandTotal ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: currencyPrecision,
    maximumFractionDigits: currencyPrecision,
  })}`;

  return (
    <button type="button" className="pos-cart-bar" onClick={onOpen} aria-haspopup="dialog">
      <span className="pos-cart-bar-count">
        <i className="bi bi-cart3" />
        <span className="pos-cart-bar-badge">{itemCount}</span>
      </span>
      <span className="pos-cart-bar-label">View cart</span>
      <span className="pos-cart-bar-total">{total}</span>
      <i className="bi bi-chevron-up" />
    </button>
  );
};

export default CartBar;
