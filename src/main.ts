import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { Logger, LoggerErrorInterceptor } from "nestjs-pino";

import { AppModule } from "./app.module.js";
import { PreferencesService } from "./preferences/preferences.service.js";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	// Logging
	app.useLogger(app.get(Logger));
	app.useGlobalInterceptors(new LoggerErrorInterceptor());

	// DTO and query parameter validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // no extra properties allowed
			forbidNonWhitelisted: true
		})
	);

	// Setup Swagger UI when not in production
	const config = app.get<ConfigService>(ConfigService);
	if (config.getOrThrow("NODE_ENV") !== "production") {
		setupSwagger(app);
	}

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

function setupSwagger(app: INestApplication): void {
	const config = new DocumentBuilder()
		.setTitle("Burzalupa API")
		.setDescription("Swagger UI for Burzalupa API endpoints")
		.setVersion("1.0.0")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("/dev/swagger", app, documentFactory);
}

try {
	await bootstrap();
} catch (e: unknown) {
	console.error(e);
}
