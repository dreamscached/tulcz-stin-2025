import { Inject } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";

import type { LogBuffer } from "./buffer/buffer.js";
import { LogHistoryRequestDto } from "./dto/get-log-history.dto.js";
import { LOG_BUFFER } from "./log.constants.js";

@WebSocketGateway({ namespace: "/log" })
export class LogGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private clients: Set<Socket> = new Set();

	constructor(@Inject(LOG_BUFFER) private readonly buffer: LogBuffer) {}

	async handleConnection(client: Socket) {
		this.clients.add(client);
		const messages = await this.buffer.getBufferedMessages();
		for (const message of messages) {
			client.emit("log", message);
		}
	}

	handleDisconnect(client: Socket) {
		this.clients.delete(client);
	}

	broadcastLog(message: string) {
		this.clients.forEach((it) => it.emit("log", message));
	}

	@SubscribeMessage("log:history")
	async handleLogHistoryRequest(@ConnectedSocket() client: Socket, @MessageBody() payload: LogHistoryRequestDto) {
		const allMessages = await this.buffer.getBufferedMessages();
		const size = payload.size ?? allMessages.length;
		const recentMessages = allMessages.slice(-size);
		client.emit("log:history", recentMessages);
	}
}
