import { dev } from '$app/environment';
import { Lucia, TimeSpan, generateId } from "lucia";
import { D1Adapter } from '@lucia-auth/adapter-sqlite'
import { password_reset } from './schemas/auth';
import { createDate } from 'oslo';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit';


export const initializeLucia = (platform: App.Platform | undefined) => {
  if (!platform) {
    //TODO: Handle this better ....
    error(500, {
      message: 'No database connection!',
    });
  }

  const adapter = new D1Adapter(platform.env.DB, {
    // table names
    user: "user",
    session: "session"
  });

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: !dev
      },
    },
    sessionExpiresIn: new TimeSpan(30, "d"), // no more active/idle
    getUserAttributes: (attributes) => {
      return {
        username: attributes.email,
        emailVerified: attributes.email_verified,
        name: attributes.name,
        roles: attributes.roles,
      };
    },
    getSessionAttributes: (attributes) => {
      return {
        ipCountry: attributes.ip_country,
        updatedAt: attributes.update_at
      };
    },
  });
}



export async function createPasswordResetToken(db: DrizzleD1Database, userId: string): Promise<string> {
  // From Lucia docs and adapted for drizzle-orm
  // Delete all password reset tokens
  await db.delete(password_reset).where(eq(password_reset.user_id, userId))

  const tokenId = generateId(40);
  const result = await db.insert(password_reset).values({
    id: tokenId,
    user_id: userId,
    expires_at: Math.floor(createDate(new TimeSpan(2, "h")).getTime() / 1000)
  }).returning({ id: password_reset.user_id })
  console.log(result)
  //const test = await db.run(restult);
  //TODO: error checking here....  and remove console.log()
  return tokenId;
}

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {
  ip_country: string;
  update_at: string;
}
interface DatabaseUserAttributes {
  email: string;
  email_verified: boolean;
  age: number;
  name: string
  roles: string;
}


