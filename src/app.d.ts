// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// This import shouldnt be needed...

import type { D1Database } from "@cloudflare/workers-types/experimental";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: import("lucia").User | null;
      session: import("lucia").Session | null;
    },
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env: {
        DB: D1Database
        WASM: Fetcher;
      },
      context: {},
      caches: {},
      cf: {},

    }
  }
}

export { };
