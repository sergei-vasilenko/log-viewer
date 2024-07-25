import { MessageType, Action, LogLevel } from "./enums";

// WebSocket
export type EventType = "open" | "reconnect" | "message" | "error" | "close";
export type EventHandler = (
  event: Event | CustomEvent | MessageEvent | CloseEvent
) => void;
export type PingIntervalId = number;

// WAMP
export type WampEventType = "welcome" | "reconnect";
export type WampEventDetail = unknown | null;
export interface IWampEvent extends CustomEvent {
  detail: WampEventDetail;
}
export type WampEventHandler = (event: IWampEvent) => void;
// ToDo: привести к правильному формату все приходящие события и ошибки (объект, строка, JSON и т.д.)
export type WelcomeResponse = [MessageType.Welcome, string, string, string];
export type CallResultResponse = [MessageType.CallResult, CallId, CallResult];
export type CallErrorResponse = [
  MessageType.CallError,
  CallId,
  Uri,
  string,
  string?
];
export type SubscribeEvent = {
  [key: string]: string | number;
};
export type SubscribeHandler = (data: SubscribeEvent) => void;
export type PublisherEventResponse = [MessageType.Event, Uri, SubscribeEvent];
export type MessageData =
  | WelcomeResponse
  | CallResultResponse
  | CallErrorResponse
  | PublisherEventResponse;
export type Uri = string;
export type CallId = string;
export type CallError = {
  uri: string;
  description: string;
  details?: string;
} | null;
export type CallResult = unknown | null;
export type ResponseHandler = (err: CallError, data: CallResult) => void;

// SERVICE
export type WelcomeDetail = {
  session_id: string;
  wamp_version: string;
  server_name: string;
};
export type LogsData = {
  Action: Action;
  Items: LogItem[];
};

export type LogItem = {
  Timestamp: string;
  Level: LogLevel;
  Message: string;
  Source: string;
};

export type LoginResult = {
  Token: string;
  Username: string;
};
