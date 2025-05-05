import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { BASE_URL } from "./tiingo.constants.js";
import { type SearchResult, StockPrices } from "./tiingo.types.js";

@Injectable()
export class TiingoService {
	constructor(private readonly config: ConfigService) {}

	async search(query: string): Promise<SearchResult[]> {
		const params = new URLSearchParams();
		params.append("query", query);
		return await this.request("/tiingo/utilities/search", params);
	}

	async getStockPrices(tickers: string[]): Promise<StockPrices[]> {
		const urlParams = encodeURIComponent(tickers.join(","));
		return await this.request(`/iex/${urlParams}`);
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
