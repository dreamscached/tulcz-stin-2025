import { ApiProperty } from "@nestjs/swagger";

import { IsString, MaxLength } from "class-validator";

export class SearchDto {
	@ApiProperty({
		description: "Search query for stock ticker",
		maxLength: 6,
		example: "AAPL"
	})
	@IsString()
	@MaxLength(6)
	query: string;
}
