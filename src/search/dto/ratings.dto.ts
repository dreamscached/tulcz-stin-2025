import { ApiProperty } from "@nestjs/swagger";

import { Transform } from "class-transformer";
import { IsArray } from "class-validator";

export class RatingsDto {
	@IsArray()
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	@Transform(({ value }) => value.toString().split(","))
	@ApiProperty({
		description: "Tickers to request ratings for",
		example: "AAPL,GOOG"
	})
	tickers: string[];
}
