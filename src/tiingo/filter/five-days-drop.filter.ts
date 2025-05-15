import type { TickerFilter } from "./filter.types.js";
import { sampleOnePerDay } from "./filter.utils.js";

export const moreThanTwoDropsInFiveDays: TickerFilter = (history) => {
	const daily = sampleOnePerDay(history);

	if (daily.length < 5) return false;

	const recentFive = daily.slice(-5);

	let drops = 0;
	for (let i = 1; i < recentFive.length; i++) {
		if (recentFive[i].tngoLast < recentFive[i - 1].tngoLast) {
			drops++;
		}
	}

	return drops > 2;
};
