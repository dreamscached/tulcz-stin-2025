import { ApiProperty } from "@nestjs/swagger";

export class Preferences {
	@ApiProperty({
		description: "Favorite, monitored stock tickers",
		isArray: true,
		nullable: false,
		type: "string"
	})
	favoriteTickers: string[];
}
