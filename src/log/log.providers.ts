import { Provider } from "@nestjs/common";

import { InMemoryLogBuffer } from "./buffer/in-memory.js";
import { LOG_BUFFER } from "./log.constants.js";

export const logBufferProviders: Provider[] = [
	{
		provide: LOG_BUFFER,
		useClass: InMemoryLogBuffer
	}
];
