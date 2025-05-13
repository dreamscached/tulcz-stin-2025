import { readFile, writeFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PinoLogger } from "nestjs-pino";

import { BASE_URL, STOCK_PRICES_HISTORY_PATH } from "./tiingo.constants.js";
import type { SearchResult, StockPrices } from "./tiingo.types.js";

@Injectable()
export class TiingoService {
	constructor(
		private readonly config: ConfigService,
		private readonly logger: PinoLogger
	) {
		logger.setContext(TiingoService.name);
	}

	async search(query: string): Promise<SearchResult[]> {
		this.logger.debug({ query }, "Searching tickers");
		const params = new URLSearchParams();
		params.append("query", query);
		return await this.request("/tiingo/utilities/search", params);
	}

	async getStockPrices(tickers: string[]): Promise<StockPrices[]> {
		if (tickers.length === 0) {
			throw new Error("At least one ticker is required");
		}
		this.logger.debug({ tickers }, "Fetching stock prices");
		const urlParams = encodeURIComponent(tickers.join(","));
		return await this.request(`/iex/${urlParams}`);
	}

	async updateStockPricesHistory(tickers: string[]): Promise<void> {
		this.logger.info({ tickers }, "Updating stock prices history");
		const prices = await this.getStockPrices(tickers);
		this.logger.debug("Merging new prices into history");
		const history = await this.getStockPricesHistory();
		history.push(...prices);

		this.logger.debug("Saving updated history");
		await this.saveStockPricesHistory(history);
		this.logger.debug("Purging old stock prices");
		await this.purgeOldStockPrices();
	}

	async purgeOldStockPrices(): Promise<void> {
		const history = await this.getStockPricesHistory();
		const staleBefore = new Date().getTime() - 5 * 86400e3;
		const purged = history.filter((it) => new Date(it.timestamp).getTime() > staleBefore);
		this.logger.info({ count: history.length - purged.length }, "Purged old stock prices");
		await this.saveStockPricesHistory(purged);
	}

	async getStockPricesHistory(): Promise<StockPrices[]> {
		this.logger.debug("Reading stock prices history file");
		try {
			const content = await readFile(STOCK_PRICES_HISTORY_PATH, { encoding: "utf8" });
			return JSON.parse(content) as StockPrices[];
		} catch (e: unknown) {
			if (typeof e === "object" && e !== null && "code" in e && e.code === "ENOENT") {
				this.logger.warn("Stock prices history file not found, returning empty array");
				return [];
			}
			throw e;
		}
	}

	async saveStockPricesHistory(history: StockPrices[]): Promise<void> {
		this.logger.debug("Saving stock prices history to file");
		await writeFile(STOCK_PRICES_HISTORY_PATH, JSON.stringify(history), { encoding: "utf8" });
	}

	async request<T = unknown>(path: string, params?: URLSearchParams): Promise<T> {
		const url = new URL(`${BASE_URL}${path}`);
		url.searchParams.append("token", this.config.getOrThrow("TIINGO_API_KEY"));
		if (params !== undefined) {
			for (const [key, value] of params) {
				url.searchParams.append(key, value);
			}
		}

		const headers = new Headers();
		headers.append("accept", "application/json");

		try {
			const res = await fetch(url, { headers });
			if (res.status !== 200) {
				const body: unknown = await res.json();
				throw new Error(`Got non-OK HTTP status code ${res.status}.`, { cause: body });
			}

			return (await res.json()) as T;
		} catch (e: unknown) {
			this.logger.error(
				{ url: url.toString(), headers: [...headers.entries()], error: e },
				"Request to Tiingo failed"
			);
			throw e;
		}
	}
}
