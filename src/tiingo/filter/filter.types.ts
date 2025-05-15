import type { StockPrices } from "../tiingo.types.js";

export interface TickerFilter {
	(history: StockPrices[]): boolean;
}
