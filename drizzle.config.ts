import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/server/schemas/*',
  out: 'drizzle',
  verbose: true
} satisfies Config;

