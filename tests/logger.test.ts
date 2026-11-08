import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createLogger,
  isSensitiveKey,
  redact,
  REDACTED,
  type LogLevel,
} from "../server/logger";

const FIXED_NOW = new Date("2026-01-02T03:04:05.678Z");

function capture(level: LogLevel = "debug") {
  const lines: { line: string; level: LogLevel }[] = [];
  const logger = createLogger({
    level,
    now: () => FIXED_NOW,
    sink: (line, lineLevel) => lines.push({ line, level: lineLevel }),
  });
  const parsed = () => lines.map(({ line }) => JSON.parse(line));
  return { logger, lines, parsed };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createLogger", () => {
  it("writes one JSON line with timestamp, level, message, and fields", () => {
    const { logger, lines, parsed } = capture();
    logger.info("health check", { route: "/api/health" });

    expect(lines).toHaveLength(1);
    expect(lines[0].line).not.toContain("\n");
    expect(parsed()[0]).toEqual({
      timestamp: "2026-01-02T03:04:05.678Z",
      level: "info",
      message: "health check",
      route: "/api/health",
    });
  });

  it("passes the level to the sink for every method", () => {
    const { logger, lines } = capture();
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    expect(lines.map((l) => l.level)).toEqual(["debug", "info", "warn", "error"]);
  });

  it("drops events below the configured level", () => {
    const { logger, parsed } = capture("warn");
    logger.debug("hidden");
    logger.info("hidden");
    logger.warn("shown");
    logger.error("shown too");
    expect(parsed().map((e) => e.message)).toEqual(["shown", "shown too"]);
  });

  it("does not let fields overwrite the core keys", () => {
    const { logger, parsed } = capture();
    logger.info("real message", {
      level: "error",
      message: "fake",
      timestamp: "never",
    });
    expect(parsed()[0]).toMatchObject({
      level: "info",
      message: "real message",
      timestamp: "2026-01-02T03:04:05.678Z",
    });
  });

  it("redacts sensitive fields before writing", () => {
    const { logger, lines } = capture();
    logger.info("login", {
      user: { email: "ada@example.com", password: "hunter2", id: 7 },
      headers: { authorization: "Bearer abc", cookie: "sid=1" },
    });
    const line = lines[0].line;
    expect(line).not.toContain("ada@example.com");
    expect(line).not.toContain("hunter2");
    expect(line).not.toContain("Bearer abc");
    expect(line).not.toContain("sid=1");
    expect(JSON.parse(line).user).toEqual({
      email: REDACTED,
      password: REDACTED,
      id: 7,
    });
  });

  it("omits trace fields when there is no active span", () => {
    const { logger, parsed } = capture();
    logger.info("no span");
    expect(parsed()[0]).not.toHaveProperty("traceId");
  });

  it("writes info to stdout and errors to stderr by default", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = createLogger({ level: "info" });
    logger.info("to stdout");
    logger.error("to stderr");
    expect(JSON.parse(log.mock.calls[0][0] as string).message).toBe("to stdout");
    expect(JSON.parse(error.mock.calls[0][0] as string).message).toBe(
      "to stderr"
    );
  });

  it("reads the default level from LOG_LEVEL", () => {
    vi.stubEnv("LOG_LEVEL", "error");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    createLogger().info("hidden");
    expect(log).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});

describe("isSensitiveKey", () => {
  it("matches common secret and PII key names regardless of case", () => {
    for (const key of [
      "password",
      "Password",
      "accessToken",
      "refresh_token",
      "Authorization",
      "set-cookie",
      "userEmail",
      "cardNumber",
      "apiKey",
      "client_secret",
    ]) {
      expect(isSensitiveKey(key), key).toBe(true);
    }
  });

  it("leaves ordinary keys alone", () => {
    for (const key of ["productId", "quantity", "route", "status", "level"]) {
      expect(isSensitiveKey(key), key).toBe(false);
    }
  });
});

describe("redact", () => {
  it("redacts nested objects and arrays without mutating the input", () => {
    const input = {
      cart: [{ productId: "drip", card: "4242 4242 4242 4242" }],
      meta: { deep: { token: "t" } },
    };
    expect(redact(input)).toEqual({
      cart: [{ productId: "drip", card: REDACTED }],
      meta: { deep: { token: REDACTED } },
    });
    expect(input.cart[0].card).toBe("4242 4242 4242 4242");
  });

  it("redacts Headers and Map entries", () => {
    const headers = new Headers({ authorization: "Bearer x", accept: "*/*" });
    const map = new Map<string, unknown>([["password", "p"], ["ok", 1]]);
    expect(redact({ headers, map })).toEqual({
      headers: { authorization: REDACTED, accept: "*/*" },
      map: { password: REDACTED, ok: 1 },
    });
  });

  it("serializes errors, dates, and bigints", () => {
    const error = new Error("boom");
    const result = redact({
      error,
      at: new Date(0),
      big: BigInt(10),
    }) as Record<string, unknown>;
    expect(result.error).toMatchObject({ name: "Error", message: "boom" });
    expect(result.at).toBe("1970-01-01T00:00:00.000Z");
    expect(result.big).toBe("10");
  });

  it("marks circular references but keeps shared ones", () => {
    const shared = { id: 1 };
    const circular: Record<string, unknown> = { shared, again: shared };
    circular.self = circular;
    expect(redact(circular)).toEqual({
      shared: { id: 1 },
      again: { id: 1 },
      self: "[Circular]",
    });
  });

  it("passes primitives through unchanged", () => {
    expect(redact("text")).toBe("text");
    expect(redact(3)).toBe(3);
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });
});
