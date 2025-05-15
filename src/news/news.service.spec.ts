import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { PinoLogger } from "nestjs-pino";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { StocksRatings } from "./dto/stocks-ratings.dto.js";
import { NewsService } from "./news.service.js";

describe("NewsService", () => {
	let service: NewsService;

	const mockConfigService = {
		getOrThrow: vi.fn().mockReturnValue("https://example.com")
	};

	const mockLogger: Partial<PinoLogger> = {
		debug: vi.fn(),
		error: vi.fn(),
		setContext: vi.fn()
	};

	let fetchMock: Mock;

	beforeEach(async () => {
		fetchMock = vi.fn();
		global.fetch = fetchMock as unknown as typeof fetch;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NewsService,
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: PinoLogger, useValue: mockLogger }
			]
		}).compile();

		service = module.get(NewsService);
	});

	it("returns ratings from API", async () => {
		const data: StocksRatings[] = [{ name: "AAPL", date: 20240101, rating: 3, sell: 0 }];

		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce(data)
		});

		const result = await service.getRatings(["AAPL"]);
		expect(result).toEqual(data);
		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it("throws on non-ok response", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: vi.fn()
		});

		await expect(service.getRatings(["AAPL"])).rejects.toThrow("News API responded with status 500");
	});

	it("throws on invalid response format", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce({ error: "bad format" })
		});

		await expect(service.getRatings(["AAPL"])).rejects.toThrow("Invalid response format from News API");
	});
});
