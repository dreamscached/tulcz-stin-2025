import { IsArray, IsString } from "class-validator";

export class CreatePreferencesDto {
	@IsArray()
	@IsString({ each: true })
	favoriteTickers: string[];
}
