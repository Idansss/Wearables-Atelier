/**
 * Environment variable validation — fail fast at startup.
 *
 * Principle: Never run with bad config. If a required env var is missing,
 * surface the error immediately with a clear message rather than failing
 * silently in production at request time.
 *
 * Call `validateEnv()` once at app bootstrap (main.tsx).
 * The `env` object is the only place the rest of the app reads env vars.
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  /** Optional — only needed if you ever fall back to direct Resend calls */
  RESEND_API_KEY?: string;
  MODE: "development" | "staging" | "production";
}

type RawEnv = Record<string, string | undefined>;

function getString(raw: RawEnv, key: string): string {
  const value = raw[key];
  if (!value || value.trim() === "") {
    throw new Error(`[env] Required environment variable ${key} is missing or empty`);
  }
  return value.trim();
}

function getOptionalString(raw: RawEnv, key: string): string | undefined {
  const value = raw[key];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

function parseMode(raw: RawEnv): EnvConfig["MODE"] {
  const mode = raw.MODE ?? raw.NODE_ENV ?? "development";
  if (mode === "production" || mode === "staging" || mode === "development") {
    return mode;
  }
  return "development";
}

/**
 * Validates all required environment variables.
 * Call once at startup — throws descriptively if anything is missing.
 */
export function validateEnv(): EnvConfig {
  const raw: RawEnv = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
    PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined,
    RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY as string | undefined,
    MODE: import.meta.env.MODE as string | undefined,
  };

  const errors: string[] = [];

  const required: Array<keyof typeof raw> = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "PAYSTACK_PUBLIC_KEY",
  ];

  for (const key of required) {
    if (!raw[key] || raw[key]!.trim() === "") {
      errors.push(`VITE_${key}`);
    }
  }

  if (errors.length > 0) {
    const msg = [
      "",
      "══════════════════════════════════════════════",
      " MISSING REQUIRED ENVIRONMENT VARIABLES",
      "══════════════════════════════════════════════",
      " The following VITE_ variables are not set:",
      "",
      ...errors.map((e) => `   ✖  ${e}`),
      "",
      " Copy .env.example → .env and fill in the values.",
      "══════════════════════════════════════════════",
      "",
    ].join("\n");

    // In development: throw so the error appears in the console immediately.
    // In production builds: log and continue with degraded state so the
    // CDN-served HTML at least loads, then individual features will fail
    // with their own error handling.
    if (import.meta.env.DEV) {
      throw new Error(msg);
    } else {
      // eslint-disable-next-line no-console
      console.error(msg);
    }
  }

  return {
    SUPABASE_URL: getString(raw, "SUPABASE_URL"),
    SUPABASE_ANON_KEY: getString(raw, "SUPABASE_ANON_KEY"),
    PAYSTACK_PUBLIC_KEY: raw.PAYSTACK_PUBLIC_KEY ?? "",
    RESEND_API_KEY: getOptionalString(raw, "RESEND_API_KEY"),
    MODE: parseMode(raw),
  };
}

/**
 * Validated environment config singleton.
 * Import `env` instead of reading `import.meta.env` directly.
 */
let _env: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

export type { EnvConfig };
