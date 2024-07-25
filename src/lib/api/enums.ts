export enum MessageType {
  Welcome = 0,
  Call = 2,
  CallResult = 3,
  CallError = 4,
  Subscribe = 5,
  Unsubscribe = 6,
  Event = 8,
  Heartbeat = 20,
}

export enum LogLevel {
  FATAL = "FATAL",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
  INFO = "INFO",
  TRACE = "TRACE",
}

export enum Action {
  Add = 0,
  Initial = 3,
}
