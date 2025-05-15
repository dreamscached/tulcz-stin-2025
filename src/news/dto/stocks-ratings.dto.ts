import { IsIn, IsInt, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class StocksRatings {
	@IsString()
	@MinLength(1)
	@MaxLength(10)
	name: string;

	@IsNumber({ allowInfinity: false, allowNaN: false })
	@IsInt()
	@Min(0)
	date: number;

	@IsNumber({ allowInfinity: false, allowNaN: false })
	@IsInt()
	@Min(-10)
	@Max(10)
	rating: number;

	@IsNumber({ allowInfinity: false, allowNaN: false })
	@IsInt()
	@IsIn([0, 1])
	sell: number;
}
