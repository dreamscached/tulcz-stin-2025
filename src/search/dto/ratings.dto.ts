import { ApiProperty } from "@nestjs/swagger";

import { Transform } from "class-transformer";
import { IsArray } from "class-validator";

export class RatingsDto {
	@IsArray()
	@Transform(({ value }) => value.toString().split(','))
	@ApiProperty({
		description: "Tickers to request ratings for",
		example: "AAPL,GOOG"
	})
	tickers: string[];
}
