import { Inject, Injectable } from "@nestjs/common";

import type { LogBuffer } from "./buffer/buffer.js";
import { LOG_BUFFER } from "./log.constants.js";
import { LogGateway } from "./log.gateway.js";

@Injectable()
export class LogService {
	constructor(
		private readonly gateway: LogGateway,
		@Inject(LOG_BUFFER) private readonly buffer: LogBuffer
	) {}

	async submit(message: string) {
		await this.buffer.push?.(message);
		this.gateway.broadcastLog(message);
	}
}
