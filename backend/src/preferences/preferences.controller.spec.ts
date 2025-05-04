import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesController } from "./preferences.controller.js";
import { PreferencesService } from "./preferences.service.js";

describe("PreferencesController", () => {
	let controller: PreferencesController;

	const mockPreferencesService = {
		hasPreferences: vi.fn(),
		getPreferences: vi.fn(),
		setPreferences: vi.fn()
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PreferencesController],
			providers: [{ provide: PreferencesService, useValue: mockPreferencesService }]
		}).compile();

		controller = module.get<PreferencesController>(PreferencesController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
