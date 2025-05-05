import { Module } from "@nestjs/common";

import { PreferencesService } from "./preferences.service.js";

@Module({
	providers: [PreferencesService]
})
export class PreferencesModule {}
