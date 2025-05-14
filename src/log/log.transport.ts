import { Writable } from "stream";

import { LogService } from "./log.service.js";

export function createPinoWebSocketTransport(logService: LogService) {
	return new Writable({
		async write(chunk: string | Buffer, _encoding, callback) {
			await logService.submit(chunk.toString());
			callback();
		}
	});
}
