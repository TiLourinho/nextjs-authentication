import { cookies } from "next/headers";
import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";

import { setCookies } from "@/src/utils/set-cookies";

import db from "./db";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
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
  const sessionCookie = lucia.createSessionCookie(session.id);

  setCookies(sessionCookie);
}

export async function verifyAuth() {
  const nullResponse = { user: null, session: null };

  const sessionCookie = cookies().get(lucia.sessionCookieName);
  if (!sessionCookie) return nullResponse;

  const sessionId = sessionCookie.value;
  if (!sessionId) return nullResponse;

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);

      setCookies(sessionCookie);
    }

    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();

      setCookies(sessionCookie);
    }
  } catch {}

  return result;
}
