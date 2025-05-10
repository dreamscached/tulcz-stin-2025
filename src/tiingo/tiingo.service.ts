import { readFile, writeFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { BASE_URL, STOCK_PRICES_HISTORY_PATH } from "./tiingo.constants.js";
import type { SearchResult, StockPrices } from "./tiingo.types.js";

@Injectable()
export class TiingoService {
	constructor(private readonly config: ConfigService) {}

	async search(query: string): Promise<SearchResult[]> {
		const params = new URLSearchParams();
		params.append("query", query);
		return await this.request("/tiingo/utilities/search", params);
	}

	async getStockPrices(tickers: string[]): Promise<StockPrices[]> {
		if (tickers.length === 0) {
			throw new Error("At least one ticker is required");
		}

		const urlParams = encodeURIComponent(tickers.join(","));
		return await this.request(`/iex/${urlParams}`);
	}

	async updateStockPricesHistory(tickers: string[]): Promise<void> {
		const prices = await this.getStockPrices(tickers);
		const history = await this.getStockPricesHistory();
		history.push(...prices);

		await this.saveStockPricesHistory(history);
		await this.purgeOldStockPrices();
	}

	async purgeOldStockPrices(): Promise<void> {
		const history = await this.getStockPricesHistory();
		const staleBefore = new Date().getTime() - 5 * 86400e3;
		const purged = history.filter((it) => new Date(it.timestamp).getTime() > staleBefore);
		await this.saveStockPricesHistory(purged);
	}

	async getStockPricesHistory(): Promise<StockPrices[]> {
		try {
			const content = await readFile(STOCK_PRICES_HISTORY_PATH, { encoding: "utf8" });
			return JSON.parse(content) as StockPrices[];
		} catch (e: unknown) {
			if (typeof e === "object" && e !== null && "code" in e && e.code === "ENOENT") {
				// History .json file does not exist
				return [];
			}
			throw e;
		}
	}

	async saveStockPricesHistory(history: StockPrices[]): Promise<void> {
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

		const res = await fetch(url, { headers });
		if (res.status !== 200) {
			const body = (await res.json()) as unknown;
			throw new Error(`Got non-OK HTTP status code ${res.status}.`, { cause: body });
		}

		return (await res.json()) as unknown as T;
	}
}
