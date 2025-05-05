import { BigIntStats } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { type MockedFunction, beforeEach, describe, expect, it, vi } from "vitest";

import { PreferencesService } from "./preferences.service.js";
import { Preferences } from "./preferences.types.js";

vi.mock("fs/promises", () => ({
	readFile: vi.fn(),
	writeFile: vi.fn(),
	mkdir: vi.fn(),
	stat: vi.fn()
}));

vi.mock("path", async () => {
	const actual = await vi.importActual<typeof path>("path");
	return {
		...actual,
		dirname: vi.fn(actual.dirname.bind(actual))
	};
});

describe("PreferencesService", () => {
	let service: PreferencesService;

	let readFileMock: MockedFunction<typeof fs.readFile>;
	let writeFileMock: MockedFunction<typeof fs.writeFile>;
	let mkdirMock: MockedFunction<typeof fs.mkdir>;
	let statMock: MockedFunction<typeof fs.stat>;

	const mockPreferences: Preferences = {
		favoriteTickers: ["AAPL", "GOOG"]
	};

	beforeEach(() => {
		service = new PreferencesService();

		readFileMock = fs.readFile as unknown as MockedFunction<typeof fs.readFile>;
		writeFileMock = fs.writeFile as unknown as MockedFunction<typeof fs.writeFile>;
		mkdirMock = fs.mkdir as unknown as MockedFunction<typeof fs.mkdir>;
		statMock = fs.stat as unknown as MockedFunction<typeof fs.stat>;

		vi.clearAllMocks();
	});

	describe("getPreferences", () => {
		it("should parse valid JSON content", async () => {
			readFileMock.mockResolvedValueOnce(JSON.stringify(mockPreferences));
			const result = await service.getPreferences();
			expect(result).toEqual(mockPreferences);
		});

		it("should throw on invalid JSON content", async () => {
			readFileMock.mockResolvedValueOnce("not-json");
			await expect(service.getPreferences()).rejects.toThrow(SyntaxError);
		});
	});

	describe("setPreferences", () => {
		it("creates directory and writes JSON to file", async () => {
			mkdirMock.mockResolvedValueOnce(undefined);
			writeFileMock.mockResolvedValueOnce(undefined);
			await service.setPreferences(mockPreferences);

			expect(mkdirMock).toHaveBeenCalledWith(expect.any(String), {
				mode: 0o777,
				recursive: true
			});

			expect(writeFileMock).toHaveBeenCalledWith(expect.any(String), JSON.stringify(mockPreferences), {
				encoding: "utf-8"
			});
		});
	});

	describe("hasPreferences", () => {
		it("returns true if preferences file exists", async () => {
			statMock.mockResolvedValueOnce({} as BigIntStats);
			const result = await service.hasPreferences();
			expect(result).toBe(true);
		});

		it("returns false if preferences file does not exist (ENOENT)", async () => {
			const err = Object.assign(new Error("File not found"), { code: "ENOENT" });
			statMock.mockRejectedValueOnce(err);
			const result = await service.hasPreferences();
			expect(result).toBe(false);
		});

		it("rethrows unexpected errors", async () => {
			const err = Object.assign(new Error("Access denied"), { code: "EACCES" });
			statMock.mockRejectedValueOnce(err);
			await expect(service.hasPreferences()).rejects.toThrow("Access denied");
		});

		it("throws if error is not an object", async () => {
			statMock.mockRejectedValueOnce("foobar");
			await expect(service.hasPreferences()).rejects.toThrow();
		});
	});
});
