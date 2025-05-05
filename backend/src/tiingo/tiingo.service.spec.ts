import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it } from "vitest";

import { TiingoService } from "./tiingo.service.js";

describe("TiingoService", () => {
	let service: TiingoService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TiingoService]
		}).compile();

		service = module.get<TiingoService>(TiingoService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
