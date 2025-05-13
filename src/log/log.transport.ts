import { Writable } from "stream";

import { LogService } from "./log.service.js";

interface ToStringTrait {
	toString(): string;
}

export function createPinoWebSocketTransport(logService: LogService) {
	return new Writable({
		async write(chunk: ToStringTrait, _encoding, callback) {
			const message = chunk.toString();
			await logService.submit(message);
			callback();
		}
	});
}
