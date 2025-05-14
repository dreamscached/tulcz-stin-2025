import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskService } from "../task/task.service.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

import { SearchController } from "./search.controller.js";
import { SearchService } from "./search.service.js";

describe("SearchController", () => {
	let controller: SearchController;

	const mockTaskService = {
		hourlyStockPricesHistoryUpdate: vi.fn()
	};

	const mockSearchService = {
		findTickers: vi.fn()
	};

	const mockTiingoService = {
		filterTickersWithHistory: vi.fn()
	};

	beforeEach(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [SearchController],
			providers: [
				{ provide: TaskService, useValue: mockTaskService },
				{ provide: SearchService, useValue: mockSearchService },
				{ provide: TiingoService, useValue: mockTiingoService }
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

	it("returns filtered tickers for /filter/3d", async () => {
		const result = ["AAPL", "TSLA"];
		mockTiingoService.filterTickersWithHistory.mockResolvedValueOnce(result);

		const response = await controller.filterTickers3d();

		expect(mockTiingoService.filterTickersWithHistory).toHaveBeenCalled();
		expect(response).toEqual(result);
	});

	it("returns filtered tickers for /filter/5d", async () => {
		const result = ["MSFT", "GOOG"];
		mockTiingoService.filterTickersWithHistory.mockResolvedValueOnce(result);

		const response = await controller.filterTickers5d();

		expect(mockTiingoService.filterTickersWithHistory).toHaveBeenCalled();
		expect(response).toEqual(result);
	});

	it("triggers hourly update on /search/update", async () => {
		await controller.forceUpdateTickers();
		expect(mockTaskService.hourlyStockPricesHistoryUpdate).toHaveBeenCalled();
	});
});
