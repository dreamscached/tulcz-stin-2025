import { Body, Controller, Get, HttpCode, NotFoundException, Patch } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { UpdatePreferencesDto } from "./dto/update-preferences.dto.js";
import { Preferences } from "./preferences.entity.js";
import { PreferencesService } from "./preferences.service.js";

@Controller("/preferences")
export class PreferencesController {
	constructor(private readonly preferences: PreferencesService) {}

	@Get()
	@ApiOperation({ summary: "Get current preferences" })
	@ApiResponse({ type: Preferences, status: 200, description: "Preferences were successfully fetched from storage" })
	@ApiResponse({ status: 404, description: "Preferences were not initialized" })
	async readPreferences(): Promise<Preferences> {
		const exists = await this.preferences.hasPreferences();
		if (!exists) {
			throw new NotFoundException("Preferences not initialized.");
		}

		return await this.preferences.getPreferences();
	}

	@Patch()
	@HttpCode(204)
	@ApiBody({ type: UpdatePreferencesDto })
	@ApiOperation({ summary: "Update preferences" })
	@ApiResponse({ status: 204, description: "Preferences were updated successfully" })
	@ApiResponse({ status: 404, description: "Preferences were not initialized" })
	async updatePreferences(@Body() dto: UpdatePreferencesDto): Promise<void> {
		const exists = await this.preferences.hasPreferences();
		if (!exists) {
			throw new NotFoundException("Preferences not initialized.");
		}

		const preferences = await this.preferences.getPreferences();
		await this.preferences.setPreferences({ ...preferences, ...dto });
	}
}
