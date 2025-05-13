import { Body, Controller, Get, NotFoundException, Patch } from "@nestjs/common";
import { ApiBody, ApiResponse } from "@nestjs/swagger";

import { PinoLogger } from "nestjs-pino";

import { UpdatePreferencesDto } from "./dto/update-preferences.dto.js";
import { Preferences } from "./preferences.entity.js";
import { PreferencesService } from "./preferences.service.js";

@Controller("/preferences")
export class PreferencesController {
	constructor(
		private readonly preferences: PreferencesService,
		private readonly logger: PinoLogger
	) {
		logger.setContext(PreferencesController.name);
	}

	@Get("/")
	@ApiResponse({ type: Preferences, status: 200, description: "Preferences were successfully fetched from storage" })
	@ApiResponse({ status: 404, description: "Preferences were not initialized" })
	async readPreferences(): Promise<Preferences> {
		this.logger.info("Handling GET /preferences");

		const exists = await this.preferences.hasPreferences();
		if (!exists) {
			this.logger.warn("Preferences file not found");
			throw new NotFoundException("Preferences not initialized.");
		}

		const prefs = await this.preferences.getPreferences();
		this.logger.debug({ prefs }, "Returning preferences");
		return prefs;
	}

	@Patch("/")
	@ApiBody({ type: UpdatePreferencesDto })
	@ApiResponse({ status: 201, description: "Preferences were updated successfully" })
	@ApiResponse({ status: 404, description: "Preferences were not initialized" })
	async updatePreferences(@Body() dto: UpdatePreferencesDto): Promise<void> {
		this.logger.info({ dto }, "Handling PATCH /preferences");

		const exists = await this.preferences.hasPreferences();
		if (!exists) {
			this.logger.warn("Preferences file not found for update");
			throw new NotFoundException("Preferences not initialized.");
		}

		const current = await this.preferences.getPreferences();
		const merged = { ...current, ...dto };

		this.logger.debug({ merged }, "Saving updated preferences");
		await this.preferences.setPreferences(merged);
		this.logger.info("Preferences successfully updated");
	}
}
