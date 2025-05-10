import { join } from "node:path";

import { FILES_DIR } from "src/app.constants.js";

export const BASE_URL = "https://api.tiingo.com";
export const IEX_DB_PATH = join(FILES_DIR, "iex_db.json");
