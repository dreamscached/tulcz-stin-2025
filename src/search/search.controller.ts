import { Controller, Get, Query } from "@nestjs/common";

import { SearchDto } from "./dto/search.dto.js";
import { MAX_SEARCH_RESULTS } from "./search.constants.js";
import { SearchService } from "./search.service.js";

@Controller("/search")
export class SearchController {
	constructor(private readonly search: SearchService) {}

	@Get()
	async findTickers(@Query() query: SearchDto): Promise<string[]> {
		return this.search.findTickers(query.query, MAX_SEARCH_RESULTS);
	}
}
