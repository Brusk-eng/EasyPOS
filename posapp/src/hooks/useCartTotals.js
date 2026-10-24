import { useMemo } from "react";
import usePOSSessionStore from "../store/posSessionStore";
import useCartStore from "../store/cartStore";
import { roundCurrency } from "../utils/number";
import { computeCartTotals } from "../utils/tax";

// The cart's price breakdown, derived from the cart + session stores so both
// the Cart panel and the mobile CartBar read identical numbers.
// Order-level tax rows come from the POS Profile's taxes_and_charges template,
// plus the additional order discount's effect on them — mirrors
// erpnext.controllers.taxes_and_totals (the discount is distributed pro-rata
// across items and tax recomputed on the reduced total). Item-level discounts
// (e.g. auto-applied by pricing rules) are independent of the order discount.
const useCartTotals = () => {
	const currencyPrecision = usePOSSessionStore((s) => s.currencyPrecision);
	const taxTemplateRows = usePOSSessionStore((s) => s.taxTemplateRows);
	const cartItems = useCartStore((s) => s.items);
	const discountOn = useCartStore((s) => s.discountOn);
	const discount = useCartStore((s) => s.discountPercentage);

	return useMemo(() => {
		const itemTotal = cartItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);
		const itemDiscountTotal = cartItems.reduce(
			(sum, item) => sum + (item.discount_amount ?? 0),
			0
		);
		const netAfterItemDiscount = roundCurrency(
			itemTotal - itemDiscountTotal,
			currencyPrecision
		);
		const { taxRows, totalTax, discountAmount, grandTotal } = computeCartTotals({
			items: cartItems,
			taxTemplateRows,
			netTotal: netAfterItemDiscount,
			discountOn,
			discountPercentage: discount,
			precision: currencyPrecision,
		});
		return { itemTotal, itemDiscountTotal, taxRows, totalTax, discountAmount, grandTotal };
	}, [cartItems, taxTemplateRows, discountOn, discount, currencyPrecision]);
};

export default useCartTotals;
