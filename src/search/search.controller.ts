import { readFile } from "node:fs/promises";

import { Body, Controller, Get, HttpCode, NotFoundException, ParseArrayPipe, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";

import { PinoLogger } from "nestjs-pino";

import { StocksRatings } from "../news/dto/stocks-ratings.dto.js";
import { RATINGS_PATH } from "../news/news.constants.js";
import { NewsService } from "../news/news.service.js";
import { PreferencesService } from "../preferences/preferences.service.js";
import { TaskService } from "../task/task.service.js";
import { moreThanTwoDropsInFiveDays } from "../tiingo/filter/five-days-drop.filter.js";
import { goingDownThreeDays } from "../tiingo/filter/three-days-drop.filter.js";
import { TiingoService } from "../tiingo/tiingo.service.js";

import { RatingsDto } from "./dto/ratings.dto.js";
import { SearchDto } from "./dto/search.dto.js";
import { MAX_SEARCH_RESULTS } from "./search.constants.js";
import { SearchService } from "./search.service.js";

@Controller("/search")
export class SearchController {
	constructor(
		private readonly logger: PinoLogger,
		private readonly preferences: PreferencesService,
		private readonly search: SearchService,
		private readonly tiingo: TiingoService,
		private readonly news: NewsService,
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
		const filtered = await this.tiingo.filterTickersWithHistory(goingDownThreeDays);
		const favorites = (await this.preferences.getPreferences()).favoriteTickers;
		return filtered.filter((t) => favorites.includes(t));
	}

	@Get("/filter/5d")
	@ApiOperation({ summary: "Tickers dropping 3+ days out of last 5 business days" })
	@ApiResponse({ status: 200, description: "Matching tickers", type: [String] })
	async filterTickers5d(): Promise<string[]> {
		const filtered = await this.tiingo.filterTickersWithHistory(moreThanTwoDropsInFiveDays);
		const favorites = (await this.preferences.getPreferences()).favoriteTickers;
		return filtered.filter((t) => favorites.includes(t));
	}

	@Post("/ratings/request")
	@HttpCode(201)
	@ApiOperation({ summary: "Requests ratings from News API for given tickers" })
	@ApiResponse({ status: 201, description: "Requested ratings", type: [StocksRatings] })
	async requestRatings(@Body(new ParseArrayPipe({ items: RatingsDto })) body: RatingsDto[]): Promise<void> {
		const tickers = new Set(body.map((it) => it.name));
		await this.news.expectRatingCallback([...tickers]);
		// This runs in background
		this.news
			.requestRatings(body.map((it) => it.name))
			.catch((err: unknown) => this.logger.error({ err }, "Failed to request ratings"));
	}

	@Post("/ratings/callback")
	@HttpCode(204)
	@ApiOperation({ summary: "Callback endpoint for News API to return ratings" })
	@ApiResponse({ status: 204, description: "Ratings saved" })
	async ratingsCallback(@Body(new ParseArrayPipe({ items: RatingsDto })) body: RatingsDto[]): Promise<void> {
		await this.news.saveRatings(body);
	}

	@Get("/ratings")
	@ApiOperation({ summary: "Returns ratings previously sent by News API " })
	@ApiResponse({ status: 200, description: "Ratings" })
	async getRatings(): Promise<StocksRatings[]> {
		try {
			const file = await readFile(RATINGS_PATH, { encoding: "utf-8" });
			return JSON.parse(file) as StocksRatings[];
		} catch (e: unknown) {
			if (typeof e === "object" && (e as { code?: string })?.code === "ENOENT") {
				throw new NotFoundException();
			} else {
				throw e;
			}
		}
	}

	@Post("/update")
	@HttpCode(202)
	@ApiOperation({ summary: "Force update ticker data" })
	@ApiResponse({ status: 201, description: "Update triggered" })
	async forceUpdateTickers(): Promise<void> {
		await this.tasks.hourlyStockPricesHistoryUpdate();
	}
}
