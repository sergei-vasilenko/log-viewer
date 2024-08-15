import WebSocketClient, { IWebSocketClient } from "@/lib/api/webSocketClient";
import RetryManager, { IRetryManager } from "../retryManager/retryManager";
import {
  Uri,
  CallError,
  CallResult,
  WampEventType,
  CallId,
  ResponseHandler,
  SubscribeHandler,
  MessageData,
  WampEventHandler,
  WampEventDetail,
} from "./types";
import { MessageType } from "./enums";
import {
  INITIAL_RECONNECT_INTERVAL,
  INITIAL_RESUBSCRUBE_INTERVAL,
} from "./constants";

interface IWampServiceSettings {
  url: string;
  uriPrefix?: string;
  pingFrequency?: number;
  maxReconnectRetries?: number;
  maxResubscribeRetries?: number;
}

export interface IWampService {
  call(
    uri: Uri,
    args?: Array<string | number>
  ): Promise<CallResult | CallError>;
  subscribe(uri: Uri, callback: (data: any) => void): void;
  unsubscribe(uri: Uri, callback?: (data: any) => void): void;
  on(eventname: WampEventType, callback: WampEventHandler): void;
}

class WampService implements IWampService {
  private socket: IWebSocketClient;
  private uriPrefix: string;
  private retryManager: IRetryManager;
  private callHandlers: Map<CallId, ResponseHandler> = new Map();
  private subscribeHandlers: Map<Uri, SubscribeHandler> = new Map();
  private events: {
    welcome: WampEventHandler | null;
    reconnect: WampEventHandler | null;
  };

  constructor(settings: IWampServiceSettings) {
    const {
      url,
      uriPrefix = "",
      maxReconnectRetries,
      maxResubscribeRetries = 5,
      pingFrequency = 30000,
    } = settings || {};

    this.socket = new WebSocketClient(url, {
      maxReconnectRetries,
      pingInterval: pingFrequency,
      initialRetryInterval: INITIAL_RECONNECT_INTERVAL,
    });
    this.retryManager = new RetryManager({
      maxRetries: maxResubscribeRetries,
      initialRetryInterval: INITIAL_RESUBSCRUBE_INTERVAL,
    });
    this.uriPrefix = uriPrefix;
    this.events = {
      welcome: null,
      reconnect: null,
    };

    this.setBasicListeners();
  }

  private emit(eventname: WampEventType, data: WampEventDetail) {
    this.events[eventname]?.(
      new CustomEvent(eventname, {
        detail: data,
      })
    );
  }

  private idGenerator(): CallId {
    const alphabet =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";

    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      randomString += alphabet.charAt(randomIndex);
    }

    return randomString;
  }

  private setBasicListeners() {
    this.socket.on("message", (event) => {
      if (event instanceof MessageEvent) {
        const messageEvent = event as MessageEvent;
        try {
          const parsedData: MessageData = JSON.parse(messageEvent.data);
          const [messageType] = parsedData;

          if (messageType === MessageType.Welcome) {
            const [_, session_id, wamp_version, server_name] = parsedData;
            this.emit("welcome", { session_id, wamp_version, server_name });
            return;
          }
          if (messageType === MessageType.CallResult) {
            const [_, callId, result] = parsedData;
            if (this.callHandlers.has(callId)) {
              this.callHandlers.get(callId)?.result(result);
              this.callHandlers.delete(callId);
            }
            return;
          }
          if (messageType === MessageType.CallError) {
            const [_, callId, uri, description, details] = parsedData;
            if (this.callHandlers.has(callId)) {
              this.callHandlers.get(callId)?.error({
                uri,
                description,
                ...(details && { details }),
              });
              this.callHandlers.delete(callId);
            }
            return;
          }
          if (messageType === MessageType.Event) {
            const [_, uri, event] = parsedData;

            if (!this.subscribeHandlers.has(uri)) return;

            const handler = this.subscribeHandlers.get(uri);

            if (event?.SubscribeError) {
              this.retryManager.try(uri);
              console.error(event.SubscribeError);
              return;
            }

            if (handler) handler(event);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error(
          `Обработайте неожиданный тип события: ${event.constructor.name}`
        );
      }
    });

    this.socket.on("reconnect", () => {
      this.emit("reconnect", null);
    });
  }

  private addCallHandler(id: CallId, handler: ResponseHandler): void {
    this.callHandlers.set(id, handler);
  }

  private getFullUri(uri: Uri): Uri {
    return this.uriPrefix ? this.uriPrefix + uri : uri;
  }

  call(
    uri: Uri,
    args: Array<string | number> = []
  ): Promise<CallResult | CallError> {
    return new Promise((resolve, reject) => {
      const callId = this.idGenerator();
      const data = JSON.stringify([
        MessageType.Call,
        callId,
        this.getFullUri(uri),
        ...args,
      ]);
      this.addCallHandler(callId, { result: resolve, error: reject });
      this.socket.send(data);
    });
  }

  subscribe(uri: Uri, callback: SubscribeHandler): void {
    const fullUri = this.getFullUri(uri);
    this.subscribeHandlers.set(fullUri, callback);
    this.socket.send(JSON.stringify([MessageType.Subscribe, fullUri]));
    this.retryManager
      .register(fullUri, callback)
      .setBeforeCallHandler(({ nextCallDelay }) =>
        console.log(
          `Не удалось подписаться по адресу ${this.getFullUri(
            fullUri
          )}. Повторная попытка через ${nextCallDelay} сек`
        )
      )
      .setFailHandler(() => {
        console.log(
          `Подписка по адресу "${this.getFullUri(
            fullUri
          )}" не удалась. Вероятно проблемы с сервером`
        );
        this.subscribeHandlers.delete(fullUri);
      });
  }

  unsubscribe(uri: Uri): void {
    const fullUri = this.getFullUri(uri);
    this.socket.send(JSON.stringify([MessageType.Unsubscribe, fullUri]));
    this.subscribeHandlers.delete(fullUri);
    this.retryManager.remove(fullUri);
  }

  on(eventname: WampEventType, callback: WampEventHandler) {
    this.events[eventname] = callback;
  }
}

export default WampService;
