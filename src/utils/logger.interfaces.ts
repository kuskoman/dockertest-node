type LogFn = (...args: any[]) => void | Promise<void>;
export type LogLevels = "verbose" | "debug" | "log" | "warn" | "error";
export type Logger = { [Level in LogLevels]: LogFn };
export type LoggerConstructor = new () => Logger;
