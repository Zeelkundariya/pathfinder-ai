import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "./mocks/server.mjs";

// Ensure AbortController and AbortSignal are consistent with Node.js native implementations
// to avoid prototype mismatch with undici's fetch in some test environments (like jsdom).
if (typeof globalThis.AbortController !== "undefined" && 
    globalThis.AbortController.name !== "AbortController" && 
    process.env.NODE_ENV === "test") {
  // Future-proofing: if the environment overrides AbortController in a way that breaks fetch,
  // this is where we would normalize it. For happy-dom, it is already compatible.
}

// Set required environment variables for tests
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());