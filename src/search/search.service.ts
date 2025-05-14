import { Injectable } from "@nestjs/common";

import { distance } from "fastest-levenshtein";

import { TiingoService } from "../tiingo/tiingo.service.js";

@Injectable()
export class SearchService {
	constructor(private readonly tiingo: TiingoService) {}

	async findTickers(query: string, limit: number): Promise<string[]> {
		const tickers = await this.tiingo.getTickerList();
		const normalizedQuery = query.toLowerCase();

		const candidates = tickers.filter((t) => t.toLowerCase().includes(normalizedQuery));

		const scored = (candidates.length ? candidates : tickers)
			.map((t) => [t, distance(normalizedQuery, t.toLowerCase())] as [string, number])
			.sort((a, b) => a[1] - b[1])
			.map(([t]) => t);

		return scored.slice(0, limit);
	}
}
