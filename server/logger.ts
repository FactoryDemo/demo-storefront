import { isSpanContextValid, trace } from "@opentelemetry/api";

export type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;
type LogSink = (line: string, level: LogLevel) => void;

export type Logger = {
  debug: (message: string, fields?: LogFields) => void;
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
};

export type LoggerOptions = {
  /** Lowest level that is written. Defaults to LOG_LEVEL, then "info". */
  level?: LogLevel;
  /** Where each JSON line goes. Defaults to stdout (stderr for warn/error). */
  sink?: LogSink;
  now?: () => Date;
};

export const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERN =
  /password|passwd|secret|token|api[-_]?key|authorization|cookie|session|email|card|cvv|ssn/i;

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MAX_DEPTH = 8;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

/**
 * Deep-copies a value for logging, replacing the value of every key that
 * looks sensitive (password, token, authorization, cookie, email, card, ...)
 * with REDACTED. Errors, Dates, Maps, and Headers become plain JSON values.
 */
export function redact(value: unknown): unknown {
  return redactValue(value, new WeakSet<object>(), 0);
}

function redactValue(
  value: unknown,
  ancestors: WeakSet<object>,
  depth: number
): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (ancestors.has(value)) {
    return "[Circular]";
  }
  if (depth >= MAX_DEPTH) {
    return "[Truncated]";
  }
  ancestors.add(value);
  const result = Array.isArray(value)
    ? value.map((item) => redactValue(item, ancestors, depth + 1))
    : redactEntries(toEntries(value), ancestors, depth);
  ancestors.delete(value);
  return result;
}

function toEntries(value: object): [string, unknown][] {
  if (
    value instanceof Map ||
    (typeof Headers !== "undefined" && value instanceof Headers)
  ) {
    return Array.from(
      value as Iterable<[unknown, unknown]>,
      ([key, entry]): [string, unknown] => [String(key), entry]
    );
  }
  return Object.entries(value);
}

function redactEntries(
  entries: [string, unknown][],
  ancestors: WeakSet<object>,
  depth: number
): LogFields {
  const result: LogFields = {};
  for (const [key, entry] of entries) {
    result[key] = isSensitiveKey(key)
      ? REDACTED
      : redactValue(entry, ancestors, depth + 1);
  }
  return result;
}

function traceContext(): LogFields {
  const spanContext = trace.getActiveSpan()?.spanContext();
  if (!spanContext || !isSpanContextValid(spanContext)) {
    return {};
  }
  return { traceId: spanContext.traceId, spanId: spanContext.spanId };
}

function resolveLevel(value: string | undefined): LogLevel {
  const candidate = value?.toLowerCase();
  return candidate !== undefined && candidate in LEVEL_ORDER
    ? (candidate as LogLevel)
    : "info";
}

function defaultSink(line: string, level: LogLevel): void {
  if (level === "warn" || level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

/**
 * Creates a logger that writes one JSON object per line with `timestamp`,
 * `level`, `message`, the active OpenTelemetry `traceId`/`spanId` when there
 * is one, and the redacted fields. Fields cannot overwrite those keys.
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const minLevel = options.level ?? resolveLevel(process.env.LOG_LEVEL);
  const sink = options.sink ?? defaultSink;
  const now = options.now ?? (() => new Date());

  function log(level: LogLevel, message: string, fields: LogFields = {}) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) {
      return;
    }
    const entry: LogFields = {
      timestamp: now().toISOString(),
      level,
      message,
      ...traceContext(),
    };
    const redacted = redact(fields) as LogFields;
    for (const [key, value] of Object.entries(redacted)) {
      if (!(key in entry)) {
        entry[key] = value;
      }
    }
    sink(JSON.stringify(entry), level);
  }

  return {
    debug: (message, fields) => log("debug", message, fields),
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
    error: (message, fields) => log("error", message, fields),
  };
}

export const logger: Logger = createLogger();
