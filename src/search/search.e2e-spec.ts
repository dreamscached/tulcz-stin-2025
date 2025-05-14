import { Server } from "node:http";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { type Response, default as request } from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../app.module.js";

describe("SearchController (e2e)", () => {
	let app: INestApplication;
	let server: Server;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();

		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true
			})
		);

		server = app.getHttpServer() as Server;
		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	it("GET /search?query=a returns matching tickers", async (): Promise<void> => {
		const res: Response = await request(server).get("/search?query=a").expect(200);

		const body = res.body as unknown;

		if (!Array.isArray(body) || !body.every((item): item is string => typeof item === "string")) {
			throw new Error("Response body is not string[]");
		}

		expect(body.length).toBeLessThanOrEqual(10);
	});

	it("GET /search without query returns 400", async (): Promise<void> => {
		await request(server).get("/search").expect(400);
	});

	it("GET /search with too long query returns 400", async (): Promise<void> => {
		await request(server).get("/search?query=toolong").expect(400);
	});
});
