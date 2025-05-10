import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesService } from "../preferences/preferences.service.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

import { TaskService } from "./task.service.js";

describe("TaskService", () => {
	let service: TaskService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TaskService,
				{ provide: TiingoService, useValue: { updateStockPricesHistory: vi.fn() } },
				{
					provide: PreferencesService,
					useValue: {
						hasPreferences: vi.fn(),
						getPreferences: vi.fn()
					}
				}
			]
		}).compile();

		service = module.get<TaskService>(TaskService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
