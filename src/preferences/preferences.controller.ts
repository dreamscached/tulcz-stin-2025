import { Body, Controller, Get, NotFoundException, Patch } from "@nestjs/common";

import { UpdatePreferencesDto } from "./dto/update-preferences.dto.js";
import { PreferencesService } from "./preferences.service.js";

@Controller("/preferences")
export class PreferencesController {
	constructor(private readonly preferences: PreferencesService) {}

	@Get("/")
	async readPreferences() {
		const exists = await this.preferences.hasPreferences();
		if (!exists) {
			throw new NotFoundException("Preferences not initialized.");
		}

		return await this.preferences.getPreferences();
	}

	@Patch("/")
	async updatePreferences(@Body() dto: UpdatePreferencesDto) {
		const exists = await this.preferences.hasPreferences();
		if (!exists) {
			throw new NotFoundException("Preferences not initialized.");
		}

		const preferences = await this.preferences.getPreferences();
		await this.preferences.setPreferences({ ...preferences, ...dto });
	}
}
