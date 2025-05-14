import type { ClassProvider } from "@nestjs/common";

import { describe, expect, it } from "vitest";

import { InMemoryLogBuffer } from "./buffer/in-memory.js";
import { LOG_BUFFER } from "./log.constants.js";
import { logBufferProviders } from "./log.providers.js";

function isClassProvider<T = unknown>(provider: unknown): provider is ClassProvider<T> {
	return typeof provider === "object" && provider !== null && "provide" in provider && "useClass" in provider;
}

describe("logBufferProviders", () => {
	it("provides LOG_BUFFER using InMemoryLogBuffer", () => {
		const match = logBufferProviders.find(isClassProvider);

		expect(match).toBeDefined();
		expect(match?.provide).toBe(LOG_BUFFER);
		expect(match?.useClass).toBe(InMemoryLogBuffer);
	});
});
