import * as fs from "node:fs/promises";

import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { PinoLogger } from "nestjs-pino";
import { Mock, MockedFunction, beforeEach, describe, expect, it, vi } from "vitest";

import { TiingoService } from "./tiingo.service.js";
import { SearchResult, StockPrices } from "./tiingo.types.js";

vi.mock("node:fs/promises", async () => {
	const actual = await vi.importActual<typeof fs>("node:fs/promises");
	return {
		...actual,
		readFile: vi.fn(),
		writeFile: vi.fn()
	};
});

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

	const mockLogger = {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		setContext: vi.fn()
	};

	let fetchMock: Mock;

	beforeEach(async () => {
		fetchMock = vi.fn();
		global.fetch = fetchMock as unknown as typeof fetch;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TiingoService,
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: PinoLogger, useValue: mockLogger }
			]
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
		it("throws if tickers array is empty", async () => {
			await expect(service.getStockPrices([])).rejects.toThrow("At least one ticker is required");
		});

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

		it('calls the /iex endpoint when "all" is passed', async () => {
			const mockPrices: StockPrices[] = [
				{
					ticker: "ALL",
					timestamp: "2024-01-01T00:00:00Z",
					quoteTimestamp: null,
					lastSaleTimestamp: null,
					last: 100,
					lastSize: null,
					tngoLast: 100,
					prevClose: 98,
					open: 99,
					high: 101,
					low: 97,
					mid: 100,
					volume: 100000,
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

			const result = await service.getStockPrices("all");

			expect(fetchMock).toHaveBeenCalled();
			expect((fetchMock.mock.calls[0][0] as unknown)?.toString?.()).toContain("/iex");
			expect(result).toEqual(mockPrices);
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

	describe("getStockPricesHistory()", () => {
		it("returns parsed JSON from file", async () => {
			const mockData: StockPrices[] = [mockStockPrice()];
			(fs.readFile as MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(JSON.stringify(mockData));

			const result = await service.getStockPricesHistory();
			expect(result).toEqual(mockData);
		});

		it("returns empty array if file does not exist", async () => {
			const error = Object.assign(new Error("not found"), { code: "ENOENT" });
			(fs.readFile as MockedFunction<typeof fs.readFile>).mockRejectedValueOnce(error);

			const result = await service.getStockPricesHistory();
			expect(result).toEqual([]);
		});

		it("rethrows unknown error", async () => {
			const error = Object.assign(new Error("access denied"), { code: "EACCES" });
			(fs.readFile as MockedFunction<typeof fs.readFile>).mockRejectedValueOnce(error);

			await expect(service.getStockPricesHistory()).rejects.toThrow("access denied");
		});
	});

	describe("saveStockPricesHistory()", () => {
		it("writes stock prices to file", async () => {
			const data = [mockStockPrice()];
			(fs.writeFile as MockedFunction<typeof fs.writeFile>).mockResolvedValueOnce();

			await service.saveStockPricesHistory(data);

			expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), JSON.stringify(data), {
				encoding: "utf8"
			});
		});
	});

	describe("purgeOldStockPrices()", () => {
		it("removes stock records older than 7 days", async () => {
			const now = Date.now();
			const old = new Date(now - 8 * 86400e3).toISOString();
			const recent = new Date(now - 1 * 86400e3).toISOString();

			(fs.readFile as MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(
				JSON.stringify([
					{ ...mockStockPrice(), timestamp: old },
					{ ...mockStockPrice(), timestamp: recent }
				])
			);

			(fs.writeFile as MockedFunction<typeof fs.writeFile>).mockResolvedValueOnce();

			await service.purgeOldStockPrices();

			const written = JSON.parse(
				(fs.writeFile as MockedFunction<typeof fs.writeFile>).mock.calls[0][1] as string
			) as StockPrices[];
			expect(written).toHaveLength(1);
			expect(written[0].timestamp).toBe(recent);
		});
	});

	describe("updateStockPricesHistory()", () => {
		it("appends new prices and purges old history", async () => {
			const newPrices = [mockStockPrice()];

			service.getStockPrices = vi.fn().mockResolvedValue(newPrices);
			service.getStockPricesHistory = vi.fn().mockResolvedValue([]);
			service.saveStockPricesHistory = vi.fn().mockResolvedValue(undefined);
			service.purgeOldStockPrices = vi.fn().mockResolvedValue(undefined);

			await service.updateStockPricesHistory(["AAPL"]);

			/* eslint-disable @typescript-eslint/unbound-method */
			expect(service.getStockPrices).toHaveBeenCalledWith(["AAPL"]);
			expect(service.saveStockPricesHistory).toHaveBeenCalledWith(newPrices);
			expect(service.purgeOldStockPrices).toHaveBeenCalled();
			/* eslint-enable @typescript-eslint/unbound-method */
		});
	});

	describe("updateTickerList()", () => {
		it("fetches all prices and saves unique tickers", async () => {
			const mockPrices: StockPrices[] = [
				{ ...mockStockPrice(), ticker: "AAPL" },
				{ ...mockStockPrice(), ticker: "GOOG" },
				{ ...mockStockPrice(), ticker: "AAPL" }
			];

			service.getStockPrices = vi.fn().mockResolvedValue(mockPrices);
			const writeSpy = fs.writeFile as MockedFunction<typeof fs.writeFile>;

			await service.updateTickerList();

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(service.getStockPrices).toHaveBeenCalledWith("all");
			expect(writeSpy).toHaveBeenCalledWith(expect.any(String), JSON.stringify(["AAPL", "GOOG"]), {
				encoding: "utf-8"
			});
		});
	});

	describe("getTickerList()", () => {
		it("returns parsed list from file", async () => {
			(fs.readFile as MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(JSON.stringify(["AAPL", "TSLA"]));

			const result = await service.getTickerList();
			expect(result).toEqual(["AAPL", "TSLA"]);
		});

		it("returns empty array if file not found", async () => {
			const err = Object.assign(new Error("File not found"), { code: "ENOENT" });
			(fs.readFile as MockedFunction<typeof fs.readFile>).mockRejectedValueOnce(err);

			const result = await service.getTickerList();
			expect(result).toEqual([]);
		});
	});

	describe("saveTickerList()", () => {
		it("writes ticker list to file", async () => {
			const writeSpy = fs.writeFile as MockedFunction<typeof fs.writeFile>;

			await service.saveTickerList(["AAPL", "MSFT"]);
			expect(writeSpy).toHaveBeenCalledWith(expect.any(String), JSON.stringify(["AAPL", "MSFT"]), {
				encoding: "utf-8"
			});
		});
	});

	describe("filterTickersWithHistory()", () => {
		const mockConfigService: Partial<ConfigService> = {
			get: vi.fn(),
			getOrThrow: vi.fn().mockReturnValue("mock-api-key")
		};

		const mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			setContext: vi.fn()
		};

		beforeEach(async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					TiingoService,
					{ provide: ConfigService, useValue: mockConfigService },
					{ provide: PinoLogger, useValue: mockLogger }
				]
			}).compile();

			service = module.get(TiingoService);
		});
	});
});

function mockStockPrice(): StockPrices {
	return {
		ticker: "AAPL",
		timestamp: new Date().toISOString(),
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
	};
}
