import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { TiingoService } from "./tiingo.service.js";
import { SearchResult, StockPrices } from "./tiingo.types.js";

describe("TiingoService", () => {
	let service: TiingoService;

	const mockConfigService: Pick<ConfigService, "get" | "getOrThrow"> = {
		get: vi.fn((key: string): string | null => {
			return key === "TIINGO_API_KEY" ? "mock-api-key" : null;
		}),
		getOrThrow: vi.fn((key: string): string => {
			if (key === "TIINGO_API_KEY") return "mock-api-key";
			throw new Error(`Missing config for ${key}`);
		})
	};

	let fetchMock: Mock;

	beforeEach(async () => {
		fetchMock = vi.fn();
		global.fetch = fetchMock as unknown as typeof fetch;

		const module: TestingModule = await Test.createTestingModule({
			providers: [TiingoService, { provide: ConfigService, useValue: mockConfigService }]
		}).compile();

		service = module.get(TiingoService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("search()", () => {
		it("calls the search endpoint and returns results", async () => {
			const mockResults: SearchResult[] = [
				{
					ticker: "AAPL",
					assetType: "Stock",
					countryCode: "US",
					isActive: true,
					name: "Apple Inc.",
					openFIGI: "BBG000B9XRY4",
					permaTicker: "12345"
				}
			];

			fetchMock.mockResolvedValueOnce({
				status: 200,
				json: vi.fn().mockResolvedValueOnce(mockResults)
			});

			const result = await service.search("apple");
			expect(result).toEqual(mockResults);
			expect(fetchMock).toHaveBeenCalled();
		});
	});

	describe("getStockPrices()", () => {
		it("calls the prices endpoint and returns stock prices", async () => {
			const mockPrices: StockPrices[] = [
				{
					ticker: "AAPL",
					timestamp: "2024-01-01T00:00:00Z",
					quoteTimestamp: null,
					lastSaleTimestamp: null,
					last: 190,
					lastSize: null,
					tngoLast: 190,
					prevClose: 189,
					open: 190,
					high: 192,
					low: 188,
					mid: 190,
					volume: 1000000,
					bidSize: null,
					bidPrice: null,
					askSize: null,
					askPrice: null
				}
			];

			fetchMock.mockResolvedValueOnce({
				status: 200,
				json: vi.fn().mockResolvedValueOnce(mockPrices)
			});

			const result = await service.getStockPrices(["AAPL"]);
			expect(result).toEqual(mockPrices);
			expect(fetchMock).toHaveBeenCalled();
		});
	});

	describe("request()", () => {
		it("throws an error on non-200 status", async () => {
			const errorBody = { error: "Invalid request" };

			fetchMock.mockResolvedValueOnce({
				status: 400,
				json: vi.fn().mockResolvedValueOnce(errorBody)
			});

			await expect(service.request("/bad-path")).rejects.toThrow("Got non-OK HTTP status code 400.");
		});

		it("returns JSON on 200 OK", async () => {
			const mockData = { foo: "bar" };

			fetchMock.mockResolvedValueOnce({
				status: 200,
				json: vi.fn().mockResolvedValueOnce(mockData)
			});

			const result = await service.request("/valid");
			expect(result).toEqual(mockData);
		});
	});
});
