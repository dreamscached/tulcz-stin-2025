import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { TiingoService } from "./tiingo.service.js";

describe("TiingoService", () => {
	let service: TiingoService;

	const mockConfigService = {
		get: vi.fn((key: string) => {
			switch (key) {
				case "TIINGO_API_KEY":
					return "mock-api-key";
				default:
					return null;
			}
		}),
		getOrThrow: vi.fn((key: string) => {
			switch (key) {
				case "TIINGO_API_KEY":
					return "mock-api-key";
				default:
					throw new Error(`Missing config value for key: ${key}`);
			}
		})
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TiingoService, { provide: ConfigService, useValue: mockConfigService }]
		}).compile();

		service = module.get<TiingoService>(TiingoService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
