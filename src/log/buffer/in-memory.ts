import { LogBuffer } from "./buffer.js";

export class InMemoryLogBuffer implements LogBuffer {
	private buffer: string[] = [];
	private readonly maxSize = 100;

	push(message: string) {
		this.buffer.push(message);
		if (this.buffer.length > this.maxSize) {
			this.buffer.shift();
		}
	}

	getBufferedMessages(): string[] {
		return [...this.buffer];
	}
}
