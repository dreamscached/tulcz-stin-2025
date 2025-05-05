import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { SearchParamsDto } from "./dto/search-params.dto.js";
import { SearchResultsDto } from "./dto/search-results.dto.js";
import { BASE_URL } from "./tiingo.constants.js";

@Injectable()
export class TiingoService {
	constructor(private readonly config: ConfigService) {}

	async search(params: SearchParamsDto) {
		const url = new URL(`${BASE_URL}/utilities/search`);
		url.searchParams.append("token", this.config.getOrThrow("TIINGO_API_KEY") + "_");
		url.searchParams.append("query", params.query);

		const headers = new Headers();
		headers.append("accept", "application/json");

		const res = await fetch(url, { headers });
		if (res.status !== 200) {
			const body = (await res.json()) as unknown;
			throw new Error(`Got non-OK HTTP status code ${res.status}.`, { cause: body });
		}

		const body = (await res.json()) as unknown as SearchResultsDto[];
		return body;
	}
}
