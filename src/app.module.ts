import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";

import { LoggerModule } from "nestjs-pino";

import { LogModule } from "./log/log.module.js";
import { PreferencesModule } from "./preferences/preferences.module.js";
import { TaskModule } from "./task/task.module.js";
import { TiingoModule } from "./tiingo/tiingo.module.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env.local", ".env"] }),
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				pinoHttp: {
					level: config.getOrThrow("NODE_ENV") !== "production" ? "trace" : "info",
					transport: config.getOrThrow("NODE_ENV") !== "production" ? { target: "pino-pretty" } : undefined,
					formatters: {
						// Keep label as string in JSON log
						level: (label: string) => ({ level: label })
					}
				}
			})
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "..", "static"),
			serveStaticOptions: {
				dotfiles: "ignore",
				maxAge: 3600e3 // 1 hour TTL
			}
		}),
		PreferencesModule,
		TiingoModule,
		ScheduleModule.forRoot(),
		TaskModule,
		LogModule
	]
})
export class AppModule {}
