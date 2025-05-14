import { IsString, MaxLength } from "class-validator";

export class SearchDto {
	@IsString()
	@MaxLength(6)
	query: string;
}
