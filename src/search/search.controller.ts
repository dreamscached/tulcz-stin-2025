import { Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";

import { TaskService } from "../task/task.service.js";
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
		private readonly tiingo: TiingoService,
		private readonly tasks: TaskService
	) {}

	@Get()
	@ApiOperation({ summary: "Search for stock tickers" })
	@ApiQuery({ name: "query", required: true, description: "Ticker symbol or partial match" })
	@ApiResponse({ status: 200, description: "List of matching tickers", type: [String] })
	async findTickers(@Query() query: SearchDto): Promise<string[]> {
		return this.search.findTickers(query.query, MAX_SEARCH_RESULTS);
	}

	@Get("/filter/3d")
	@ApiOperation({ summary: "Tickers going down 3 consecutive days" })
	@ApiResponse({ status: 200, description: "Matching tickers", type: [String] })
	async filterTickers3d(): Promise<string[]> {
		return this.tiingo.filterTickersWithHistory(goingDownThreeDays);
	}

	@Get("/filter/5d")
	@ApiOperation({ summary: "Tickers dropping 3+ days out of last 5 business days" })
	@ApiResponse({ status: 200, description: "Matching tickers", type: [String] })
	async filterTickers5d(): Promise<string[]> {
		return this.tiingo.filterTickersWithHistory(moreThanTwoDropsInFiveDays);
	}

	@Post("/update")
	@HttpCode(202)
	@ApiOperation({ summary: "Force update ticker data" })
	@ApiResponse({ status: 201, description: "Update triggered" })
	async forceUpdateTickers(): Promise<void> {
		await this.tasks.hourlyStockPricesHistoryUpdate();
	}
}
