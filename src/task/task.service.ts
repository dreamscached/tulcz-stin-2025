import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { PreferencesService } from "../preferences/preferences.service.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

@Injectable()
export class TaskService {
	constructor(
		private readonly tiingo: TiingoService,
		private readonly preferences: PreferencesService
	) {}

	@Cron("0 0,6,12,18 * * *")
	async hourlyStockPricesHistoryUpdate() {
		const hasPreferences = await this.preferences.hasPreferences();
		if (hasPreferences) {
			const pref = await this.preferences.getPreferences();
			if (pref.favoriteTickers.length > 0) {
				await this.tiingo.updateStockPricesHistory(pref.favoriteTickers);
			}
		}
	}
}
