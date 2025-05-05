import { Module } from "@nestjs/common";

import { TiingoService } from "./tiingo.service.js";

@Module({
	providers: [TiingoService]
})
export class TiingoModule {}
