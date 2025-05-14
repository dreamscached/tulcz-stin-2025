import type { StockPrices } from "../tiingo.types.js";

export function sampleOnePerDay(entries: StockPrices[]): StockPrices[] {
	const byDate = new Map<string, StockPrices>();

	for (const entry of entries) {
		if (!entry.tngoLast) continue;

		const dateKey = entry.timestamp.slice(0, 10); // YYYY-MM-DD
		const current = byDate.get(dateKey);

		if (!current || new Date(entry.timestamp) > new Date(current.timestamp)) {
			byDate.set(dateKey, entry);
		}
	}

	return Array.from(byDate.values()).sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
	);
}
