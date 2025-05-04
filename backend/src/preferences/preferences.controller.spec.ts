import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesController } from "./preferences.controller.js";
import { PreferencesService } from "./preferences.service.js";
import { Preferences } from "./preferences.types.js";

type UpdatePreferencesDto = Partial<Preferences>;

describe("PreferencesController", () => {
	let controller: PreferencesController;

	let mockPreferencesService: {
		hasPreferences: ReturnType<typeof vi.fn>;
		getPreferences: ReturnType<typeof vi.fn>;
		setPreferences: ReturnType<typeof vi.fn>;
	};

	const mockPrefs: Preferences = {
		favoriteTickers: ["AAPL", "GOOG"]
	};

	beforeEach(async () => {
		mockPreferencesService = {
			hasPreferences: vi.fn(),
			getPreferences: vi.fn(),
			setPreferences: vi.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [PreferencesController],
			providers: [
				{
					provide: PreferencesService,
					useValue: mockPreferencesService
				}
			]
		}).compile();

		controller = module.get<PreferencesController>(PreferencesController);
	});

	describe("readPreferences", () => {
		it("returns preferences if they exist", async () => {
			mockPreferencesService.hasPreferences.mockResolvedValueOnce(true);
			mockPreferencesService.getPreferences.mockResolvedValueOnce(mockPrefs);

			const result = await controller.readPreferences();
			expect(result).toEqual(mockPrefs);
		});

		it("throws NotFoundException if preferences do not exist", async () => {
			mockPreferencesService.hasPreferences.mockResolvedValueOnce(false);

			await expect(controller.readPreferences()).rejects.toThrowError(NotFoundException);
		});
	});

	describe("updatePreferences", () => {
		it("updates merged preferences when they exist", async () => {
			mockPreferencesService.hasPreferences.mockResolvedValueOnce(true);
			mockPreferencesService.getPreferences.mockResolvedValueOnce(mockPrefs);
			mockPreferencesService.setPreferences.mockResolvedValueOnce(undefined);

			const updateDto: UpdatePreferencesDto = {
				favoriteTickers: ["MSFT"]
			};

			await controller.updatePreferences(updateDto);

			expect(mockPreferencesService.setPreferences).toHaveBeenCalledWith({
				favoriteTickers: ["MSFT"]
			});
		});

		it("throws NotFoundException if preferences do not exist", async () => {
			mockPreferencesService.hasPreferences.mockResolvedValueOnce(false);

			await expect(controller.updatePreferences({ favoriteTickers: ["NFLX"] })).rejects.toThrowError(
				NotFoundException
			);
		});
	});
});
