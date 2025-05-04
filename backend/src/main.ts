import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const port = app.get(ConfigService).get<string>("APP_PORT");
	await app.listen(+(port ?? 3000));
}

try {
	await bootstrap();
} catch (e: unknown) {
	console.error(e);
}
