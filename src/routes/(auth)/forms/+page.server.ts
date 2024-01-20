// Taken from lucia auth help
import { initializeLucia } from "$lib/server/lucia";
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  logout: async ({ platform, locals, cookies }) => {
    if (!locals.session) {
      return fail(401);
    }
    const auth = initializeLucia(platform);

    await auth.invalidateSession(locals.session.id);
    const sessionCookie = auth.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    return redirect(302, "/login");
  }
};
