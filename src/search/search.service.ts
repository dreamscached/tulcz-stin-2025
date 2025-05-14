import { Injectable } from "@nestjs/common";

import { TiingoService } from "../tiingo/tiingo.service.js";

@Injectable()
export class SearchService {
	constructor(private readonly tiingo: TiingoService) {}

	async findTickers(query: string, limit: number): Promise<string[]> {
		const tickers = await this.tiingo.getTickerList();
		const match = tickers.filter((it) => it.toLowerCase().startsWith(query.toLowerCase()));
		return match.slice(0, limit);
	}
}
