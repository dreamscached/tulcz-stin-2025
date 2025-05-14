import { Controller, Get, Query } from "@nestjs/common";

import { moreThanTwoDropsInFiveDays } from "../tiingo/filter/five-days-drop.filter.js";
import { goingDownThreeDays } from "../tiingo/filter/three-days-drop.filter.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

import { SearchDto } from "./dto/search.dto.js";
import { MAX_SEARCH_RESULTS } from "./search.constants.js";
import { SearchService } from "./search.service.js";

@Controller("/search")
export class SearchController {
	constructor(
		private readonly search: SearchService,
		private readonly tiingo: TiingoService
	) {}

	@Get()
	async findTickers(@Query() query: SearchDto): Promise<string[]> {
		return this.search.findTickers(query.query, MAX_SEARCH_RESULTS);
	}

	@Get("/filter/3d")
	async filterTickers3d(): Promise<string[]> {
		return this.tiingo.filterTickersWithHistory(goingDownThreeDays);
	}

	@Get("/filter/5d")
	async filterTickers5d(): Promise<string[]> {
		return this.tiingo.filterTickersWithHistory(moreThanTwoDropsInFiveDays);
	}
}
