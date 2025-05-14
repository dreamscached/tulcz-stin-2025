import { Test, TestingModule } from "@nestjs/testing";

import { PinoLogger } from "nestjs-pino";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesService } from "../preferences/preferences.service.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

import { TaskService } from "./task.service.js";

describe("TaskService", () => {
	let service: TaskService;

	let tiingoMock: {
		updateStockPricesHistory: ReturnType<typeof vi.fn>;
	};

	let preferencesMock: {
		hasPreferences: ReturnType<typeof vi.fn>;
		getPreferences: ReturnType<typeof vi.fn>;
	};

	const mockLogger = {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		setContext: vi.fn()
	};

	beforeEach(async () => {
		tiingoMock = {
			updateStockPricesHistory: vi.fn()
		};

		preferencesMock = {
			hasPreferences: vi.fn(),
			getPreferences: vi.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TaskService,
				{ provide: TiingoService, useValue: tiingoMock },
				{ provide: PreferencesService, useValue: preferencesMock },
				{ provide: PinoLogger, useValue: mockLogger }
			]
		}).compile();

		service = module.get<TaskService>(TaskService);
	});

	describe("hourlyStockPricesHistoryUpdate()", () => {
		it("does nothing if preferences file does not exist", async () => {
			preferencesMock.hasPreferences.mockResolvedValueOnce(false);

			await service.hourlyStockPricesHistoryUpdate();

			expect(preferencesMock.hasPreferences).toHaveBeenCalled();
			expect(preferencesMock.getPreferences).not.toHaveBeenCalled();
			expect(tiingoMock.updateStockPricesHistory).not.toHaveBeenCalled();
		});

		it("does nothing if favoriteTickers is empty", async () => {
			preferencesMock.hasPreferences.mockResolvedValueOnce(true);
			preferencesMock.getPreferences.mockResolvedValueOnce({ favoriteTickers: [] });

			await service.hourlyStockPricesHistoryUpdate();

			expect(preferencesMock.getPreferences).toHaveBeenCalled();
			expect(tiingoMock.updateStockPricesHistory).not.toHaveBeenCalled();
		});

		it("calls updateStockPricesHistory with favorite tickers", async () => {
			preferencesMock.hasPreferences.mockResolvedValueOnce(true);
			preferencesMock.getPreferences.mockResolvedValueOnce({
				favoriteTickers: ["AAPL", "MSFT"]
			});

			await service.hourlyStockPricesHistoryUpdate();

			expect(tiingoMock.updateStockPricesHistory).toHaveBeenCalledWith(["AAPL", "MSFT"]);
		});
	});
});
