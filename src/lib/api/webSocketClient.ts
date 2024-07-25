import RetryManager, { IRetryManager } from "@/lib/retryManager/retryManager";
import { EventType, EventHandler, PingIntervalId } from "@/lib/api/types";

interface ClientSettings {
  maxReconnectRetries?: number;
  pingInterval?: number;
  initialRetryInterval?: number;
}

export interface IWebSocketClient {
  on(eventname: EventType, handler: EventHandler): void;
  send(data: string | ArrayBuffer | Blob | ArrayBufferView): void;
  close(): void;
}

class WebSocketClient extends EventTarget implements IWebSocketClient {
  private url: string;
  private socket: null | WebSocket;
  private retryManager: IRetryManager;
  private pingInterval: PingIntervalId | undefined;
  private pingIntervalValue: number;
  private userEventHandlers: Array<{ type: EventType; handler: EventHandler }> =
    [];
  private messageQueue: Array<string | ArrayBuffer | Blob | ArrayBufferView> =
    [];

  constructor(url: string, settings?: ClientSettings) {
    super();
    const {
      maxReconnectRetries = 5,
      pingInterval = 0,
      initialRetryInterval,
    } = settings || {};

    this.url = url;
    this.pingInterval;
    this.pingIntervalValue = pingInterval;
    this.socket = null;
    this.retryManager = new RetryManager({
      maxRetries: maxReconnectRetries,
      initialRetryInterval,
    });

    this.retryManager
      .register("reconnect", () => this.connect(true))
      .setBeforeCallHandler(({ nextCallDelay }) =>
        console.log(`Попытка переподключения через ${nextCallDelay / 1000} сек`)
      )
      .setFailHandler(() =>
        console.log("Достигнуто максимальное количество попыток")
      );

    this.connect();
  }

  private dequeue() {
    while (
      this.messageQueue.length &&
      this.socket?.readyState === WebSocket.OPEN
    ) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private ping(data = null) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(this.createPingFrame(data));
    }
  }

  private createPingFrame(data: any) {
    const pingFrame = {
      opcode: "0x9",
      data: data,
    };
    return JSON.stringify(pingFrame);
  }

  private startPing() {
    if (this.pingIntervalValue === 0) return;
    this.pingInterval = setInterval(() => {
      this.ping();
    }, this.pingIntervalValue);
  }

  private stopPing() {
    clearInterval(this.pingInterval);
    this.pingInterval = undefined;
  }

  private processReconnect(event: CloseEvent) {
    console.log(`Соединение закрыто: ${event.reason}`);
    this.retryManager.try("reconnect");
  }

  private setBasicListeners(): void {
    if (!this.socket) return;

    const onOpenHandler = () => {
      console.log("Соединение установлено");
      this.userEventHandlers.forEach(({ type, handler }) => {
        this.socket?.addEventListener(type, handler);
      });
      this.retryManager.reset("reconnect");
      this.dequeue();
      this.startPing();
    };

    const onCloseHandler = (event: CloseEvent) => {
      this.userEventHandlers.forEach(({ type, handler }) => {
        this.socket?.removeEventListener(type, handler);
      });
      this.socket?.removeEventListener("open", onOpenHandler);
      this.processReconnect(event);
      this.stopPing();
    };

    this.socket.addEventListener("open", onOpenHandler);
    this.socket.addEventListener("close", onCloseHandler);
  }

  private connect(isReconnect = false): void {
    this.socket = new WebSocket(this.url);
    this.setBasicListeners();
    if (isReconnect) {
      this.dispatchEvent(new CustomEvent("reconnect"));
    }
  }

  on(type: EventType, handler: EventHandler) {
    if (!this.socket) return;
    this.socket.addEventListener(type, handler);
    this.userEventHandlers.push({ type, handler });
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(data);
      this.connect();
      return;
    }
    this.socket.send(data);
  }

  close(): void {
    this.socket?.close();
  }
}

export default WebSocketClient;
