import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it } from "vitest";

import { PreferencesService } from "./preferences.service.js";

describe("PreferencesService", () => {
	let service: PreferencesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PreferencesService]
		}).compile();

		service = module.get<PreferencesService>(PreferencesService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
