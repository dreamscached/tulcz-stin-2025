export interface LogBuffer {
	getBufferedMessages(): string[] | Promise<string[]>;
	push(message: string): void | Promise<void>;
}
