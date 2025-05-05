import { Controller, Get, InternalServerErrorException, Query } from "@nestjs/common";

import { SearchParamsDto } from "./dto/search-params.dto.js";
import { SearchResultsDto } from "./dto/search-results.dto.js";
import { TiingoService } from "./tiingo.service.js";

@Controller("/stock")
export class TiingoController {
	constructor(private readonly tiingo: TiingoService) {}

	@Get("/search")
	async search(@Query() params: SearchParamsDto): Promise<SearchResultsDto[]> {
		try {
			return await this.tiingo.search(params);
		} catch (e: unknown) {
			console.error(e); // TODO: replace with proper logging
			throw new InternalServerErrorException();
		}
	}
}
