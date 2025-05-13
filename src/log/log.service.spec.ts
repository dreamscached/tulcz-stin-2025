import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LogBuffer } from "./buffer/buffer.js";
import { LOG_BUFFER } from "./log.constants.js";
import { LogGateway } from "./log.gateway.js";
import { LogService } from "./log.service.js";

describe("LogService", () => {
	let service: LogService;

	const gatewayMock = {
		broadcastLog: vi.fn()
	};

	const bufferMock: LogBuffer = {
		getBufferedMessages: vi.fn().mockReturnValue([]),
		push: vi.fn()
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LogService,
				{ provide: LogGateway, useValue: gatewayMock },
				{ provide: LOG_BUFFER, useValue: bufferMock }
			]
		}).compile();

		service = module.get(LogService);
	});

	describe("submit", () => {
		it("should call broadcastLog with the message", async () => {
			await service.submit("test message");

			expect(gatewayMock.broadcastLog).toHaveBeenCalledWith("test message");
		});

		it("should add message to the buffer", async () => {
			await service.submit("buffered log");

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(bufferMock.push).toHaveBeenCalledWith("buffered log");
		});
	});
});
