import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { Injectable } from "@nestjs/common";

import { PinoLogger } from "nestjs-pino";

import { PREFERENCES_PATH } from "./preferences.constants.js";
import { Preferences } from "./preferences.entity.js";

@Injectable()
export class PreferencesService {
	constructor(private readonly logger: PinoLogger) {
		logger.setContext(PreferencesService.name);
	}

	async getPreferences(): Promise<Preferences> {
		this.logger.debug("Reading preferences from file");
		const json = await readFile(PREFERENCES_PATH, { encoding: "utf-8" });
		this.logger.debug("Successfully read preferences");
		return JSON.parse(json) as Preferences; // TODO: validate
	}

	async setPreferences(preferences: Preferences): Promise<void> {
		this.logger.info({ preferences }, "Saving preferences");
		await mkdir(dirname(PREFERENCES_PATH), { mode: 0o777, recursive: true });
		const json = JSON.stringify(preferences);
		await writeFile(PREFERENCES_PATH, json, { encoding: "utf-8" });
		this.logger.debug("Preferences saved");
	}

	async hasPreferences(): Promise<boolean> {
		this.logger.debug("Checking if preferences file exists");
		try {
			await stat(PREFERENCES_PATH);
			this.logger.debug("Preferences file found");
			return true;
		} catch (e: unknown) {
			if (typeof e === "object" && e !== null && "code" in e && e.code === "ENOENT") {
				this.logger.warn("Preferences file not found");
				return false;
			} else {
				this.logger.error({ error: e }, "Unexpected error when checking preferences");
				throw e;
			}
		}
	}
}
