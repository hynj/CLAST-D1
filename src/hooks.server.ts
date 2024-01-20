import { building, dev } from "$app/environment";
import { initializeLucia } from "$lib/server/lucia";
import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  if (dev && !event.platform) {

    const mf = await import('./lib/server/miniflare');
    event.platform = await mf.setupPlatform();
  }


  if (!building) {
    // This is suggested lucia code taken from https://v3.lucia-auth.com/
    // With minor changes

    const lucia = initializeLucia(event.platform)
    const sessionId = event.cookies.get(lucia.sessionCookieName);

    if (!sessionId) {
      event.locals.user = null;
      event.locals.session = null;
      //TODO: implement better login redirect
      // You can specifiy locations where only logged in users can access here
      if (event.url.pathname.startsWith('/dash') || event.url.pathname.startsWith('/api')) {
        redirect(303, '/login');
      } else {

        return resolve(event);
      }
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);

      event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    event.locals.user = user;
    event.locals.session = session;

    if (event.url.pathname.startsWith('/dashboard') || event.url.pathname.startsWith('/api')) {
      if (!session || !event.locals.user.roles.includes('admin')) {
        redirect(303, '/login');
      }
    }
  }

  return await resolve(event);
}
