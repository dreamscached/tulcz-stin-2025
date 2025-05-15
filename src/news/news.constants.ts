import { join } from "node:path";

import { FILES_DIR } from "../app.constants.js";

export const HTTP_REQUEST_TIMEOUT = 10e3; // 10 sec
export const RETRY_DELAY_MS = 1e3;
export const MAX_RETRIES = 5;

export const RATINGS_PATH = join(FILES_DIR, "ratings.json");
export const EXPECT_RATINGS_PATH = join(FILES_DIR, "expect_ratings.json");
