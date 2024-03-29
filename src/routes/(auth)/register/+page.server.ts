import { fail, redirect } from '@sveltejs/kit';
import { insertUserSchema, user } from '$lib/server/schemas/auth';
import type { Actions } from './$types';
import { initializeLucia } from '$lib/server/lucia';
import { generateId } from 'lucia';
import { password as pschema } from '$lib/server/schemas/auth'
import { flatten, safeParse } from 'valibot';
import { argonHash } from '$lib/server/hash-functions';
import { drizzle } from 'drizzle-orm/d1';

export const actions: Actions = {
  default: async ({ request, cookies, locals, platform }) => {
    const formData = Object.fromEntries(await request.formData());
    const result = safeParse(insertUserSchema, formData);

    const db = drizzle(platform?.env.DB!)
    const lucia = initializeLucia(platform);

    if (result.success) {
      const username = result.output.email;
      const password = result.output.password;
      const name = result.output.name;

      try {
        const userId = generateId(15);
        const hashedPassword = await argonHash(platform, password);
        if (!hashedPassword) throw new Error("Internal error");

        const response = await db.insert(user).values({
          id: userId,
          name: name,
          email: username,
        }).returning({ insertedID: user.id }).onConflictDoNothing({ target: user.id });

        if (!response?.length) {
          throw new Error("Email already in use!");
        }

        if (response.length < 1) {
          const { password, ...rest } = formData;
          return fail(400, {
            data: rest,
            errors: { formError: ['Email already in use!'], fieldErrors: null }
          });

        }

        const queryResponse = await db.insert(pschema).values({
          hashedPassword,
          userId
        }).returning({ userId: pschema.userId })

        if (queryResponse.length < 1) {
          const { password, ...rest } = formData;
          return fail(400, {
            data: rest,
            errors: { formError: ['Error occured, please re-try later'], fieldErrors: null }
          });
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

        console.log(e);

        const { password, ...rest } = formData;
        return fail(400, {
          data: rest,
          errors: {
            formError: [errorMessage],
            fieldErrors: null
          }
        });
      }
    } else {
      const fieldErrors = flatten(result.issues);
      const { password, ...rest } = formData;

      // See password reset for explanation of this mess...
      const summedErrors = fieldErrors.root ? { confirmPassword: fieldErrors.root, ...fieldErrors.nested } : { ...fieldErrors.nested };

      return fail(400, {
        data: rest,
        errors: {
          fieldErrors: summedErrors,
          formError: null
        }
      });
    }

    redirect(302, '/profile');
  }
};
