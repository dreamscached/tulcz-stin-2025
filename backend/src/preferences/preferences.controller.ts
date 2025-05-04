import { Body, Controller, Get, Inject, NotFoundException, Patch } from "@nestjs/common";

import { UpdatePreferencesDto } from "./dto/update-preferences.dto.js";
import { PreferencesService } from "./preferences.service.js";

@Controller("/preferences")
export class PreferencesController {
	constructor(
		@Inject()
		private readonly preferences: PreferencesService
	) {}

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
		console.log(dto);
		await this.preferences.setPreferences({ ...preferences, ...dto });
	}
}
