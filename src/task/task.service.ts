import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { PinoLogger } from "nestjs-pino";

import { PreferencesService } from "../preferences/preferences.service.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

@Injectable()
export class TaskService {
	constructor(
		private readonly tiingo: TiingoService,
		private readonly preferences: PreferencesService,
		private readonly logger: PinoLogger
	) {
		logger.setContext(TaskService.name);
	}

	@Cron("0 0,6,12,18 * * 1-5")
	async hourlyStockPricesHistoryUpdate() {
		this.logger.info("Running scheduled task: hourlyStockPricesHistoryUpdate");
		const hasPreferences = await this.preferences.hasPreferences();

		if (!hasPreferences) {
			this.logger.warn("Preferences file does not exist. Skipping update.");
			return;
		}

		const pref = await this.preferences.getPreferences();
		if (pref.favoriteTickers.length === 0) {
			this.logger.warn("No favorite tickers configured. Skipping update.");
			return;
		}

		this.logger.info({ tickers: pref.favoriteTickers }, "Updating stock price history for favorite tickers");
		await this.tiingo.updateStockPricesHistory(pref.favoriteTickers);
		this.logger.info("Stock price history updated");
	}

	@Cron("0 0 * * 1-5") // except weekends
	async dailyTickerUpdate() {
		this.logger.info("Running scheduled task: dailyTickerUpdate");
		this.logger.info("Updating ticker list");
		await this.tiingo.updateTickerList();
	}
}
