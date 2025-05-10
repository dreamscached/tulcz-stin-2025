import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { Injectable } from "@nestjs/common";

import { PREFERENCES_PATH } from "./preferences.constants.js";
import { Preferences } from "./preferences.entity.js";

@Injectable()
export class PreferencesService {
	async getPreferences(): Promise<Preferences> {
		const json = await readFile(PREFERENCES_PATH, { encoding: "utf-8" });
		return JSON.parse(json) as Preferences; // TODO: validate
	}

	async setPreferences(preferences: Preferences): Promise<void> {
		await mkdir(dirname(PREFERENCES_PATH), { mode: 0o777, recursive: true });
		const json = JSON.stringify(preferences);
		await writeFile(PREFERENCES_PATH, json, { encoding: "utf-8" });
	}

	async hasPreferences(): Promise<boolean> {
		try {
			await stat(PREFERENCES_PATH);
			return true;
		} catch (e: unknown) {
			if (typeof e === "object" && e !== null && "code" in e && e.code === "ENOENT") {
				return false;
			} else {
				throw e;
			}
		}
	}
}
