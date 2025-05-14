import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { TiingoService } from "../tiingo/tiingo.service.js";

import { SearchService } from "./search.service.js";

describe("SearchService", () => {
	let service: SearchService;
	const mockTiingo = {
		getTickerList: vi.fn()
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SearchService, { provide: TiingoService, useValue: mockTiingo }]
		}).compile();

		service = module.get(SearchService);
	});

	it("returns matching tickers (case-insensitive)", async () => {
		mockTiingo.getTickerList.mockResolvedValue(["AAPL", "GOOG", "msft"]);

		const result = await service.findTickers("g", 10);
		expect(result).toEqual(["GOOG"]);
	});

	it("limits the number of results", async () => {
		mockTiingo.getTickerList.mockResolvedValue(["AAPL", "AA", "AB", "AC", "AD"]);

		const result = await service.findTickers("a", 3);
		expect(result).toEqual(["AAPL", "AA", "AB"]);
	});
});
