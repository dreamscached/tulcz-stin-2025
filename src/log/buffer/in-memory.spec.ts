import { describe, expect, it } from "vitest";

import { InMemoryLogBuffer } from "./in-memory.js";

describe("InMemoryLogBuffer", () => {
	it("should store and retrieve messages", () => {
		const buffer = new InMemoryLogBuffer();
		buffer.push("log1");
		buffer.push("log2");

		const messages = buffer.getBufferedMessages();
		expect(messages).toEqual(["log1", "log2"]);
	});

	it("should respect max size", () => {
		const buffer = new InMemoryLogBuffer();
		for (let i = 0; i < 110; i++) {
			buffer.push(`log${i}`);
		}

		const messages = buffer.getBufferedMessages();
		expect(messages.length).toBe(100);
		expect(messages[0]).toBe("log10");
	});
});
