import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import request from "supertest";
import { beforeEach, describe, it } from "vitest";

import { AppModule } from "../src/app.module.js";

describe("AppController (e2e)", () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it("/hello (GET)", () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return request(app.getHttpServer()).get("/hello").expect(200).expect("Hello World!");
	});
});
