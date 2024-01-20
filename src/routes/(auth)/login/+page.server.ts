import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { initializeLucia } from '$lib/server/lucia';
import { object, string, safeParse, flatten } from 'valibot';
import { eq } from 'drizzle-orm';
import { password as passwordSchema, user } from '$lib/server/schemas/auth'
import { argonVerify } from '$lib/server/hash-functions';
import { drizzle } from 'drizzle-orm/d1'

const loginSchema = object({
  email: string(),
  password: string()
});

export const load = (async ({ locals }) => {
  const session = locals.session;
  if (session) redirect(302, '/');
  return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, platform, cookies }) => {

    const formData = Object.fromEntries(await request.formData());

    const result = safeParse(loginSchema, formData);
    if (result.success) {
      const lucia = initializeLucia(platform);
      const db = drizzle(platform?.env.DB!)

      const username = result.output.email;
      const password = result.output.password;


      try {
        const existingUser = await db.select().from(user).where(eq(user.email, username));

        if (!existingUser?.length) {
          throw new Error("Incorrect username or password");
        }

        const userId = existingUser[0].id;
        const hashedPasswordQuery = await db.select().from(passwordSchema).where(eq(passwordSchema.userId, userId));
        const hashedPassword = hashedPasswordQuery.at(0)?.hashedPassword;

        if (!hashedPassword) {
          throw new Error("Database error");
        }

        //const ScryptInstance = new Scrypt();
        //const hashResult = await ScryptInstance.verify(hashedPassword, password);

        const hashResult = await argonVerify(platform, hashedPassword, password);

        if (!hashResult) {
          throw new Error("Incorrect username or password");
        }

        const ipCountry = request.headers.get('cf-ipcountry') ?? 'dev';
        const session = await lucia.createSession(userId, { ip_country: ipCountry, update_at: new Date().toISOString().slice(0, 19).replace('T', ' ') });
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
          path: ".",
          ...sessionCookie.attributes
        });
      } catch (e) {
        let errorMessage = "Internal error: please try again";
        if (e instanceof Error) {
          errorMessage = e.message
        }
        // invalid username/password
        console.log(e);

        const { password, ...rest } = formData; // eslint-disable-line
        return fail(401, {
          data: rest,
          errors: {
            formError: [errorMessage],
            fieldErrors: null
          }
        });
      }


    } else {
      const fieldErrors = flatten(result.issues);
      const { password, ...rest } = formData; // eslint-disable-line

      console.log(result.issues);
      return fail(400, {
        data: rest,
        errors: {
          fieldErrors: fieldErrors.nested,
          formError: null
        }
      });
    }
    redirect(302, '/');
  }
};

