import { Module } from "@nestjs/common";

import { LogGateway } from "./log.gateway.js";
import { logBufferProviders } from "./log.providers.js";
import { LogService } from "./log.service.js";

@Module({
	providers: [LogGateway, LogService, ...logBufferProviders],
	exports: [LogGateway]
})
export class LogModule {}
