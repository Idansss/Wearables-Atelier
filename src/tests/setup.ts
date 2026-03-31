// Vitest global test setup

// Mock import.meta.env for tests
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_ANON_KEY: "test-anon-key",
    VITE_PAYSTACK_PUBLIC_KEY: "pk_test_key",
    MODE: "test",
    DEV: false,
    PROD: false,
    SSR: false,
  },
  writable: true,
});
