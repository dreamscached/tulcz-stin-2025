import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SearchDto } from "./dto/search.dto.js";
import { SearchController } from "./search.controller.js";
import { SearchService } from "./search.service.js";

describe("SearchController", () => {
	let controller: SearchController;

	let mockSearchService: {
		findTickers: ReturnType<typeof vi.fn>;
	};

	beforeEach(async () => {
		mockSearchService = {
			findTickers: vi.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [SearchController],
			providers: [
				{
					provide: SearchService,
					useValue: mockSearchService
				}
			]
		}).compile();

		controller = module.get<SearchController>(SearchController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("returns result from SearchService.findTickers", async () => {
		const query: SearchDto = { query: "aa" };
		const result = ["AAPL", "AAON"];

		mockSearchService.findTickers.mockResolvedValueOnce(result);

		const response = await controller.findTickers(query);

		expect(mockSearchService.findTickers).toHaveBeenCalledWith("aa", 10);
		expect(response).toEqual(result);
	});
});
