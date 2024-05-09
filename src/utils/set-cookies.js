import { cookies } from "next/headers";

export function setCookies(cookie) {
  return cookies().set(cookie.name, cookie.value, cookie.attributes);
}
