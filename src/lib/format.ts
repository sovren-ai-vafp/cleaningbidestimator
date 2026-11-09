/** Number formatting shared by every component. */
export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const cents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 3 });
export const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
