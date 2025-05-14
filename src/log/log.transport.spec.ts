import { describe, expect, it, vi } from "vitest";

import type { LogService } from "./log.service.js";
import { createPinoWebSocketTransport } from "./log.transport.js";

describe("createPinoWebSocketTransport", () => {
	it("calls LogService.submit with the string chunk", async () => {
		const logService: Partial<LogService> = {
			submit: vi.fn().mockResolvedValue(undefined)
		};

		const transport = createPinoWebSocketTransport(logService as LogService);

		await new Promise<void>((resolve, reject) => {
			transport.write("hello world", "utf-8", (err) => {
				try {
					expect(err).toBeNull();
					expect(logService.submit).toHaveBeenCalledWith("hello world");
					resolve();
				} catch (e) {
					reject(e instanceof Error ? e : new Error(String(e)));
				}
			});
		});
	});
});
