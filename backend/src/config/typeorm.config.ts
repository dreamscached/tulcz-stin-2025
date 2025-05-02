import { ConfigService } from "@nestjs/config";

import { DataSourceOptions } from "typeorm";

export function createOptionsWithConfig(config: ConfigService): DataSourceOptions {
	return {
		...configBase,
		type: "postgres",
		url: config.getOrThrow<string>("POSTGRES_URL")
	};
}

export const configBase = {
	entities: ["./dist/src/**/*.entity.js"],
	migrations: ["./dist/src/migrations/*.js"]
};
