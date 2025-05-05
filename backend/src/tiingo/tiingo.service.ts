import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { BASE_URL } from "./tiingo.constants.js";
import { type SearchResult } from "./tiingo.types.js";

@Injectable()
export class TiingoService {
	constructor(private readonly config: ConfigService) {}

	async search(query: string) {
		const url = new URL(`${BASE_URL}/utilities/search`);
		url.searchParams.append("token", this.config.getOrThrow("TIINGO_API_KEY") + "_");
		url.searchParams.append("query", query);

		const headers = new Headers();
		headers.append("accept", "application/json");

		const res = await fetch(url, { headers });
		if (res.status !== 200) {
			const body = (await res.json()) as unknown;
			throw new Error(`Got non-OK HTTP status code ${res.status}.`, { cause: body });
		}

		const body = (await res.json()) as unknown as SearchResult[];
		return body;
	}
}
