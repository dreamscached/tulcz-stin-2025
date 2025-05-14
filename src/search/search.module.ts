import { Module } from "@nestjs/common";

import { TiingoModule } from "../tiingo/tiingo.module.js";

import { SearchController } from "./search.controller.js";
import { SearchService } from "./search.service.js";

@Module({
	imports: [TiingoModule],
	providers: [SearchService],
	controllers: [SearchController]
})
export class SearchModule {}
