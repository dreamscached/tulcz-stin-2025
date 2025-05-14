import { IsInt, IsOptional, Min } from "class-validator";

export class LogHistoryRequestDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	size?: number;
}
