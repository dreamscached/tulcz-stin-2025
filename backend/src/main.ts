import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { PreferencesService } from "./preferences/preferences.service.js";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	await createInitialPreferences(app);

	const port = app.get(ConfigService).get<string>("APP_PORT");
	await app.listen(+(port ?? 3000));
}

async function createInitialPreferences(app: INestApplication): Promise<void> {
	const preferences = app.get(PreferencesService);
	if (!(await preferences.hasPreferences())) {
		await preferences.setPreferences({
			favoriteTickers: []
		});
	}
}

try {
	await bootstrap();
} catch (e: unknown) {
	console.error(e);
}
