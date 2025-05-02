import { DataSource, type DataSourceOptions } from "typeorm";

import { configBase } from "./typeorm.config.js";

// NOTE: this config is ONLY used for applying migrations as it is used by TypeORM directly
// and DOES NOT use Nest's lifecycle. DO NOT use it for any other purpose.
// P.S. also used for schema:drop.

export default new DataSource(createOptionsWithEnv());

function createOptionsWithEnv(): DataSourceOptions {
	const postgresUrl = process.env["POSTGRES_URL"];
	if (!postgresUrl?.length) {
		throw new Error(`Environment variable $POSTGRES_URL is not set.`);
	}

	return {
		...configBase,
		type: "postgres",
		url: postgresUrl
	};
}
