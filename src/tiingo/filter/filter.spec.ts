import { describe, expect, it } from "vitest";

import type { StockPrices } from "../tiingo.types.js";

import { moreThanTwoDropsInFiveDays } from "./five-days-drop.filter.js";
import { goingDownThreeDays } from "./three-days-drop.filter.js";

const price = (date: string, tngoLast: number): StockPrices => ({
	ticker: "MOCK",
	timestamp: `${date}T16:00:00Z`,
	quoteTimestamp: null,
	lastSaleTimestamp: null,
	last: null,
	lastSize: null,
	tngoLast,
	prevClose: 0,
	open: 0,
	high: 0,
	low: 0,
	mid: 0,
	volume: 0,
	bidSize: null,
	bidPrice: null,
	askSize: null,
	askPrice: null
});

describe("Ticker Filters", () => {
	describe("goingDownThreeDays", () => {
		it("returns true for 3 consecutive down days", () => {
			const data = [price("2024-05-01", 105), price("2024-05-02", 103), price("2024-05-03", 100)];
			expect(goingDownThreeDays(data)).toBe(true);
		});

		it("returns false if there's an upward day", () => {
			const data = [price("2024-05-01", 105), price("2024-05-02", 103), price("2024-05-03", 104)];
			expect(goingDownThreeDays(data)).toBe(false);
		});

		it("returns false if fewer than 3 days", () => {
			const data = [price("2024-05-01", 105), price("2024-05-02", 104)];
			expect(goingDownThreeDays(data)).toBe(false);
		});
	});

	describe("moreThanTwoDropsInFiveDays", () => {
		it("returns true for 3 drops in last 5 business days", () => {
			const data = [
				price("2024-04-29", 110),
				price("2024-04-30", 108),
				price("2024-05-01", 109),
				price("2024-05-02", 107),
				price("2024-05-03", 105)
			];
			expect(moreThanTwoDropsInFiveDays(data)).toBe(true);
		});

		it("returns false for 2 or fewer drops", () => {
			const data = [
				price("2024-04-29", 110),
				price("2024-04-30", 111),
				price("2024-05-01", 109),
				price("2024-05-02", 110),
				price("2024-05-03", 108)
			];
			expect(moreThanTwoDropsInFiveDays(data)).toBe(false);
		});

		it("returns false if fewer than 2 days", () => {
			const data = [price("2024-05-01", 100)];
			expect(moreThanTwoDropsInFiveDays(data)).toBe(false);
		});
	});
});
