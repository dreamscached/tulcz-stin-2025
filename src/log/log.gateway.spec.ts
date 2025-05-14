import { Test, TestingModule } from "@nestjs/testing";

import type { Socket } from "socket.io";
import { type Mocked, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogBuffer } from "./buffer/buffer.js";
import { LOG_BUFFER } from "./log.constants.js";
import { LogGateway } from "./log.gateway.js";

describe("LogGateway", () => {
	let gateway: LogGateway;

	let bufferMock: Mocked<LogBuffer>;
	let clientMock: Socket;

	beforeEach(async () => {
		vi.clearAllMocks();

		bufferMock = {
			getBufferedMessages: vi.fn(),
			push: vi.fn()
		};

		clientMock = {
			emit: vi.fn()
		} as unknown as Socket;

		const module: TestingModule = await Test.createTestingModule({
			providers: [LogGateway, { provide: LOG_BUFFER, useValue: bufferMock }]
		}).compile();

		gateway = module.get(LogGateway);
	});

	describe("handleConnection", () => {
		it("should send buffered messages as individual 'log' events", async () => {
			bufferMock.getBufferedMessages.mockResolvedValue(["foo", "bar"]);

			await gateway.handleConnection(clientMock);

			/* eslint-disable @typescript-eslint/unbound-method */
			expect(clientMock.emit).toHaveBeenCalledTimes(2);
			expect(clientMock.emit).toHaveBeenCalledWith("log", "foo");
			expect(clientMock.emit).toHaveBeenCalledWith("log", "bar");
			/* eslint-enable @typescript-eslint/unbound-method */
		});
	});

	describe("broadcastLog", () => {
		it("should emit message to all connected clients", () => {
			const client1 = { emit: vi.fn() } as unknown as Socket;
			const client2 = { emit: vi.fn() } as unknown as Socket;

			gateway["clients"].add(client1);
			gateway["clients"].add(client2);

			gateway.broadcastLog("message");

			/* eslint-disable @typescript-eslint/unbound-method */
			expect(client1.emit).toHaveBeenCalledWith("log", "message");
			expect(client2.emit).toHaveBeenCalledWith("log", "message");
			/* eslint-enable @typescript-eslint/unbound-method */
		});
	});

	describe("handleDisconnect", () => {
		it("should remove client from the set", () => {
			gateway["clients"].add(clientMock);
			expect(gateway["clients"].has(clientMock)).toBe(true);

			gateway.handleDisconnect(clientMock);

			expect(gateway["clients"].has(clientMock)).toBe(false);
		});
	});
});
