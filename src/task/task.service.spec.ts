import { Test, TestingModule } from "@nestjs/testing";

import { beforeEach, describe, expect, it } from "vitest";

import { TaskService } from "./task.service.js";

describe("TaskService", () => {
	let service: TaskService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TaskService]
		}).compile();

		service = module.get<TaskService>(TaskService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
