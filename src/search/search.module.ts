import { Module } from "@nestjs/common";

import { NewsModule } from "../news/news.module.js";
import { PreferencesModule } from "../preferences/preferences.module.js";
import { TaskModule } from "../task/task.module.js";
import { TiingoModule } from "../tiingo/tiingo.module.js";

import { SearchController } from "./search.controller.js";
import { SearchService } from "./search.service.js";

@Module({
	imports: [TiingoModule, TaskModule, NewsModule, PreferencesModule],
	providers: [SearchService],
	controllers: [SearchController]
})
export class SearchModule {}
