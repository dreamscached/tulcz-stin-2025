import { IsString, MaxLength } from "class-validator";

export class SearchParamsDto {
	@IsString()
	@MaxLength(100)
	query: string;
}
