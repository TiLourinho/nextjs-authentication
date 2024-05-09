import { cookies } from "next/headers";
import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";

import db from "./db";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
});

const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = await lucia.createAuthCookie(session);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function verifyAuth() {
  const sessionCookie = cookies().get(lucia.sessionCookieName);
  const nullResponse = { user: null, session: null };

  if (!sessionCookie) return nullResponse;

  const sessionId = sessionCookie.value;

  if (!sessionId) return nullResponse;

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  return result;
}
