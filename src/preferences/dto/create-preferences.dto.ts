import { ApiProperty } from "@nestjs/swagger";

import { IsArray, IsString } from "class-validator";

export class CreatePreferencesDto {
	@IsArray()
	@IsString({ each: true })
	@ApiProperty({
		description: "Favorite, monitored stock tickers",
		isArray: true,
		nullable: false,
		type: "string"
	})
	favoriteTickers: string[];
}
