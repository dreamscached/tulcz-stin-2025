import { Test, TestingModule } from "@nestjs/testing";

import type { Socket } from "socket.io";
import { Mocked, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogBuffer } from "./buffer/buffer.js";
import { LOG_BUFFER } from "./log.constants.js";
import { LogGateway } from "./log.gateway.js";

describe("LogGateway", () => {
	let gateway: LogGateway;

	const bufferMock: Mocked<LogBuffer> = {
		getBufferedMessages: vi.fn(),
		push: vi.fn()
	};

	const clientMock = {
		emit: vi.fn()
	} as unknown as Socket;

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [LogGateway, { provide: LOG_BUFFER, useValue: bufferMock }]
		}).compile();

		gateway = module.get(LogGateway);
	});

	describe("handleLogHistoryRequest", () => {
		it("emits all logs if no size is given", async () => {
			const logs = ["a", "b", "c"];
			bufferMock.getBufferedMessages.mockResolvedValue(logs);

			await gateway.handleLogHistoryRequest(clientMock, {});

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(clientMock.emit).toHaveBeenCalledWith("log:history", logs);
		});

		it("emits last N logs when size is given", async () => {
			const logs = Array.from({ length: 5 }, (_, i) => `log ${i + 1}`);
			bufferMock.getBufferedMessages.mockResolvedValue(logs);

			await gateway.handleLogHistoryRequest(clientMock, { size: 2 });

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(clientMock.emit).toHaveBeenCalledWith("log:history", ["log 4", "log 5"]);
		});
	});
});
