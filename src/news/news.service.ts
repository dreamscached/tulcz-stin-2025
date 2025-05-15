import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PinoLogger } from "nestjs-pino";

import { StocksRatings } from "./dto/stocks-ratings.dto.js";
import { HTTP_REQUEST_TIMEOUT } from "./news.constants.js";

@Injectable()
export class NewsService {
	constructor(
		private readonly logger: PinoLogger,
		private readonly config: ConfigService
	) {
		this.logger.setContext(NewsService.name);
	}

	async getRatings(tickers: string[]): Promise<StocksRatings[]> {
		const url = new URL("/rating", this.config.getOrThrow("NEWS_API_ORIGIN"));
		const body = JSON.stringify(tickers.map((name) => ({ name, date: 0, rating: 0, sell: 0 })));
		this.logger.debug({ url: url.toString(), body }, "Requesting ratings");

		const MAX_RETRIES = 5;
		const RETRY_DELAY_MS = 1000;

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				const response = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					signal: AbortSignal.timeout(HTTP_REQUEST_TIMEOUT),
					body
				});

				if (!response.ok) {
					throw new Error(`News API responded with status ${response.status}`);
				}

				const data = (await response.json()) as unknown;
				if (!Array.isArray(data)) {
					throw new Error("Invalid response format from News API");
				}

				this.logger.debug({ data }, "Received ratings");
				return data as StocksRatings[];
			} catch (e: unknown) {
				this.logger.error({ err: e, attempt }, "Failed to fetch ratings");

				if (attempt === MAX_RETRIES) {
					throw e;
				}

				await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
			}
		}

		throw new Error("Unreachable: exceeded retry limit");
	}
}
