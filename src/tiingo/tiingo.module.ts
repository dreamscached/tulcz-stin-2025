import { Module } from "@nestjs/common";

import { TiingoService } from "./tiingo.service.js";

@Module({
	providers: [TiingoService],
	exports: [TiingoService]
})
export class TiingoModule {}
