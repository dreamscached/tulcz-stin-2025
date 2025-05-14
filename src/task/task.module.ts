import { Module } from "@nestjs/common";

import { PreferencesModule } from "../preferences/preferences.module.js";
import { TiingoModule } from "../tiingo/tiingo.module.js";

import { TaskService } from "./task.service.js";

@Module({
	imports: [TiingoModule, PreferencesModule],
	exports: [TaskService],
	providers: [TaskService]
})
export class TaskModule {}
