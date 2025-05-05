import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { TiingoController } from "./tiingo.controller.js";
import { TiingoService } from "./tiingo.service.js";

describe("TiingoController", () => {
	let controller: TiingoController;

	let mockTiingoService: {
		search: ReturnType<typeof vi.fn>;
	};

	beforeEach(async () => {
		mockTiingoService = {
			search: vi.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TiingoController],
			providers: [
				{
					provide: TiingoService,
					useValue: mockTiingoService
				}
			]
		}).compile();

		controller = module.get<TiingoController>(TiingoController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
