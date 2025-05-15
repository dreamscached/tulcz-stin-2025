import type { TickerFilter } from "./filter.types.js";
import { sampleOnePerDay } from "./filter.utils.js";

export const goingDownThreeDays: TickerFilter = (history) => {
	const daily = sampleOnePerDay(history);
	if (daily.length < 3) return false;

	const recent = daily.slice(-3).reverse();
	return recent[0].tngoLast < recent[1].tngoLast && recent[1].tngoLast < recent[2].tngoLast;
};
