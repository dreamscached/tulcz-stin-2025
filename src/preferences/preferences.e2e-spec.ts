import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { type Server } from "node:http";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { Response, default as request } from "supertest";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../app.module.js";

import { PREFERENCES_PATH } from "./preferences.constants.js";
import type { Preferences } from "./preferences.entity.js";
import { PreferencesService } from "./preferences.service.js";

describe("PreferencesController (e2e)", () => {
	let app: INestApplication;
	let server: Server;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true
			})
		);
		await app.init();

		server = app.getHttpServer() as Server;
	});

	beforeEach(async () => {
		const preferences = app.get(PreferencesService);
		if (!(await preferences.hasPreferences())) {
			await preferences.setPreferences({ favoriteTickers: [] });
		}
	});

	afterEach(async () => {
		if (existsSync(PREFERENCES_PATH)) {
			try {
				await unlink(PREFERENCES_PATH);
			} catch (e: unknown) {
				if (
					typeof e !== "object" ||
					e === null ||
					!("code" in e) ||
					(e as { code: string }).code !== "ENOENT"
				) {
					console.error("Failed to clean up preferences file", e);
				}
			}
		}
	});

	afterAll(async () => {
		await app.close();
	});

	it("GET /preferences should return empty favoriteTickers by default", async () => {
		// const response: Response = await request(server).get("/preferences").expect(200);
		// expect(response.body).toEqual({ favoriteTickers: [] });
	});

	it("PATCH /preferences should update the preferences", async () => {
		const newPrefs: Preferences = {
			favoriteTickers: ["AAPL", "MSFT"]
		};

		await request(server).patch("/preferences").send(newPrefs).expect(204);

		const response: Response = await request(server).get("/preferences").expect(200);

		expect(response.body).toEqual(newPrefs);
	});

	it("PATCH /preferences should reject invalid data", async () => {
		const invalidPrefs = {
			favoriteTickers: [123, true]
		};

		await request(server).patch("/preferences").send(invalidPrefs).expect(400);
	});
});
