import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it } from "vitest";

import { TiingoController } from "./tiingo.controller.js";

describe("TiingoController", () => {
	let controller: TiingoController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TiingoController]
		}).compile();

		controller = module.get<TiingoController>(TiingoController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
