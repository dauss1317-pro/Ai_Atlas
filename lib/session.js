// lib/session.js
import { getIronSession } from "iron-session";

export const sessionOptions = {
  password: "some-super-strong-password-32-characters-long!",
  cookieName: "login_app_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSession(handler) {
  return getIronSession(handler, sessionOptions);
}