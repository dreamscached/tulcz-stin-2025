import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { PreferencesModule } from "./preferences/preferences.module.js";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", ".env.local"] }),
		ServeStaticModule.forRoot({
			rootPath: "static",
			serveStaticOptions: {
				dotfiles: "ignore",
				maxAge: 3600e3 // 1 hour TTL
			}
		}),
		PreferencesModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
