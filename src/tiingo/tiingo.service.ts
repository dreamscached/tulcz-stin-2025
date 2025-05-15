import { readFile, writeFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PinoLogger } from "nestjs-pino";

import { TickerFilter } from "./filter/filter.types.js";
import { BASE_URL, STOCK_PRICES_HISTORY_PATH, TICKER_LIST_PATH } from "./tiingo.constants.js";
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
		return this.request("/tiingo/utilities/search", params);
	}

	async getStockPrices(tickers: string[] | "all"): Promise<StockPrices[]> {
		if (tickers !== "all" && tickers.length === 0) {
			throw new Error(`At least one ticker is required or the literal "all" to fetch all`);
		}

		if (tickers === "all") {
			this.logger.debug("Requesting all available stock prices");
			return this.request(`/iex`);
		}

		this.logger.debug({ tickers }, "Fetching stock prices for specific tickers");
		const urlParams = encodeURIComponent(tickers.join(","));
		return this.request(`/iex/${urlParams}`);
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
		const staleBefore = new Date().getTime() - 7 * 86400e3;
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

	async getTickerList(): Promise<string[]> {
		this.logger.debug("Reading ticker list file");
		try {
			const content = await readFile(TICKER_LIST_PATH, { encoding: "utf8" });
			return JSON.parse(content) as string[];
		} catch (e: unknown) {
			if (typeof e === "object" && e !== null && "code" in e && e.code === "ENOENT") {
				this.logger.warn("Ticker list file not found, returning empty array");
				return [];
			}
			throw e;
		}
	}

	async updateTickerList(): Promise<void> {
		this.logger.info("Updating ticker list");
		const prices = await this.getStockPrices("all");
		const tickers = new Set<string>();
		prices.map((it) => tickers.add(it.ticker));

		this.logger.debug("Saving updated ticker list");
		await this.saveTickerList([...tickers]);
	}

	async saveTickerList(tickers: string[]): Promise<void> {
		this.logger.debug("Saving ticker list to file");
		await writeFile(TICKER_LIST_PATH, JSON.stringify(tickers), { encoding: "utf-8" });
	}

	async filterTickersWithHistory(filter: TickerFilter): Promise<string[]> {
		this.logger.debug("Loading stock price history for filtering");

		const history = await this.getStockPricesHistory();

		// Group by ticker
		const byTicker: Map<string, StockPrices[]> = new Map();
		for (const entry of history) {
			const list = byTicker.get(entry.ticker) ?? [];
			list.push(entry);
			byTicker.set(entry.ticker, list);
		}

		this.logger.debug({ count: byTicker.size }, "Applying filter to tickers");

		// Apply filter
		const matching: string[] = [];
		for (const [ticker, records] of byTicker.entries()) {
			if (filter(records)) {
				matching.push(ticker);
			}
		}

		this.logger.info({ count: matching.length }, "Tickers matched the filter");
		return matching;
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
