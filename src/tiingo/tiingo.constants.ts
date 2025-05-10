import { join } from "node:path";

import { FILES_DIR } from "../app.constants.js";

export const BASE_URL = "https://api.tiingo.com";
export const STOCK_PRICES_HISTORY_PATH = join(FILES_DIR, "stock_prices_history.json");
