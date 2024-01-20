import { sql } from 'drizzle-orm';
import { sqliteTable, text, blob, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-valibot';
import { custom, email, forward, merge, minLength, nullish, object, regex, string, toTrimmed } from 'valibot';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  email_verified: integer('email_verified', { mode: 'boolean' }).default(false),
  name: text('name').notNull(),
  roles: text('roles').default('USER'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('update_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const email_verification = sqliteTable('email_verification', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull(),
  code: text('code').notNull(),
  user_id: text('user_id').unique().notNull().references(() => user.id),
  email: text('email').notNull(),
  expires_at: blob('expires_at', { mode: 'bigint' })
})

export const password_reset = sqliteTable('password_reset', {
  id: text('id').notNull().primaryKey(),
  user_id: text('user_id').notNull().references(() => user.id),
  expires_at: blob('expires_at').notNull()

})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  activeExpires: blob('expires_at', {
    mode: 'bigint'
  }).notNull(),
  ipCountry: text('ip_country'),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text('update_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});


export const key = sqliteTable('key', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  hashedPassword: text('hashed_password').notNull()
});

export const oauth = sqliteTable("oauth_account", {
  providerId: text("provider_id").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id)
}, (table) => {
  return {
    pk: primaryKey({ name: 'id_userid_key', columns: [table.providerId, table.providerUserId] }),
  }
})


export const password = sqliteTable("password", {
  hashedPassword: text("hashed_password").notNull(),
  userId: text("user_id").notNull().references(() => user.id)
})

// Create a minimal valibot schema from the drizzle schema, needs more helpful errors
const insertUserDerived = createInsertSchema(user, {
  id: nullish(string()),
  email: (schema) => string([toTrimmed(), email()])
});


export const passwordShema = object(
  {
    password: string([minLength(8, 'Password too short'),
    regex(/[a-z]/, 'Your password must contain a lowercase letter.'),
    regex(/[A-Z]/, 'Your password must contain a uppercase letter.'),
    regex(/[0-9]/, 'Your password must contain a number.')]),
    confirmPassword: string([minLength(1, 'Please confirm password')])
  },
  [
    forward(
      custom(
        ({ password, confirmPassword }) => password === confirmPassword,
        'The passwords do not match.'
      ),
      ['confirmPassword']
    ),
  ]
);

export const insertUserSchema = merge([insertUserDerived, passwordShema]);
