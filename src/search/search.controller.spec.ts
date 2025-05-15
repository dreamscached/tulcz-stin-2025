import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { NewsService } from "../news/news.service.js";
import { PreferencesService } from "../preferences/preferences.service.js";
import { TaskService } from "../task/task.service.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

import { SearchController } from "./search.controller.js";
import { SearchService } from "./search.service.js";

describe("SearchController", () => {
	let controller: SearchController;

	const mockNewsService = {
		getRatings: vi.fn()
	};

	const mockTaskService = {
		hourlyStockPricesHistoryUpdate: vi.fn()
	};

	const mockSearchService = {
		findTickers: vi.fn()
	};

	const mockTiingoService = {
		filterTickersWithHistory: vi.fn()
	};

	let mockPreferencesService: {
		getPreferences: ReturnType<typeof vi.fn>;
	};

	beforeEach(async () => {
		mockPreferencesService = {
			getPreferences: vi.fn()
		};

		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [SearchController],
			providers: [
				{ provide: TaskService, useValue: mockTaskService },
				{ provide: SearchService, useValue: mockSearchService },
				{ provide: TiingoService, useValue: mockTiingoService },
				{ provide: PreferencesService, useValue: mockPreferencesService },
				{ provide: NewsService, useValue: mockNewsService }
			]
		}).compile();

		controller = moduleRef.get<SearchController>(SearchController);
	});

	it("returns result from SearchService.findTickers", async () => {
		const query = { query: "aa" };
		const result = ["AAPL", "AAON"];
		mockSearchService.findTickers.mockResolvedValueOnce(result);

		const response = await controller.findTickers(query);

		expect(mockSearchService.findTickers).toHaveBeenCalledWith("aa", 10);
		expect(response).toEqual(result);
	});

	it("returns filtered tickers that are also favorites for /filter/3d", async () => {
		mockTiingoService.filterTickersWithHistory.mockResolvedValueOnce(["AAPL", "TSLA", "GOOG"]);
		mockPreferencesService.getPreferences.mockResolvedValueOnce({
			favoriteTickers: ["AAPL", "GOOG"]
		});

		const result = await controller.filterTickers3d();
		expect(result).toEqual(["AAPL", "GOOG"]);
	});

	it("returns filtered tickers that are also favorites for /filter/5d", async () => {
		mockTiingoService.filterTickersWithHistory.mockResolvedValueOnce(["MSFT", "GOOG"]);
		mockPreferencesService.getPreferences.mockResolvedValueOnce({
			favoriteTickers: ["GOOG"]
		});

		const result = await controller.filterTickers5d();
		expect(result).toEqual(["GOOG"]);
	});

	it("triggers hourly update on /search/update", async () => {
		await controller.forceUpdateTickers();
		expect(mockTaskService.hourlyStockPricesHistoryUpdate).toHaveBeenCalled();
	});
});
