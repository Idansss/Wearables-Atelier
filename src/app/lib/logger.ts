/**
 * Structured logger for the Wearables Atelier frontend service layer.
 *
 * Principles followed (from the engineering roadmap):
 * - Always JSON-structured output (easily parsed by log aggregators)
 * - Automatic redaction of sensitive fields (tokens, passwords, API keys)
 * - Log levels: error > warn > info > debug
 * - debug is silenced in production
 * - Never log: passwords, tokens, API keys, PII (full card numbers, etc.)
 */

type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// In production builds Vite replaces import.meta.env.MODE at build time
const IS_PROD = import.meta.env.MODE === "production";
const MIN_LEVEL: LogLevel = IS_PROD ? "info" : "debug";

/** Fields that must never appear in logs */
const REDACTED_KEYS = new Set([
  "password",
  "passwordHash",
  "password_hash",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "credit_card",
  "cvv",
  "ssn",
]);

function redact(obj: unknown, depth = 0): unknown {
  if (depth > 5) return "[MAX_DEPTH]";
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => redact(item, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = REDACTED_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redact(value, depth + 1);
  }
  return result;
}

function log(level: LogLevel, event: string, data?: Record<string, unknown>): void {
  if (LEVEL_PRIORITY[level] > LEVEL_PRIORITY[MIN_LEVEL]) return;

  const entry = {
    level,
    event,
    ts: new Date().toISOString(),
    ...(data ? (redact(data) as Record<string, unknown>) : {}),
  };

  const line = JSON.stringify(entry);

  /* eslint-disable no-console */
  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      console.debug(line);
      break;
    default:
      console.info(line);
  }
  /* eslint-enable no-console */
}

export const logger = {
  /**
   * ERROR — unhandled failures, broken flows.
   * These should trigger alerts in a real monitoring setup.
   */
  error(event: string, data?: Record<string, unknown>): void {
    log("error", event, data);
  },

  /**
   * WARN — degraded behaviour, unexpected but handled.
   */
  warn(event: string, data?: Record<string, unknown>): void {
    log("warn", event, data);
  },

  /**
   * INFO — business events: order placed, user registered, job completed.
   */
  info(event: string, data?: Record<string, unknown>): void {
    log("info", event, data);
  },

  /**
   * DEBUG — developer context: cache hits, query details.
   * Silenced in production builds.
   */
  debug(event: string, data?: Record<string, unknown>): void {
    log("debug", event, data);
  },
};

export default logger;
