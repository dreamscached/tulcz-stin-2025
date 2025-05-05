import { Module } from "@nestjs/common";

import { TiingoController } from "./tiingo.controller.js";
import { TiingoService } from "./tiingo.service.js";

@Module({
	providers: [TiingoService],
	controllers: [TiingoController]
})
export class TiingoModule {}
