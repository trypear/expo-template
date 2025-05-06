import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { adapter, handlers, isSecureContext } from "@acme/auth";
import { eq, user } from "@acme/db";
import { db } from "@acme/db/client";
import { getFirstEl } from "@acme/utils";

import { env } from "~/env";

const EXPO_COOKIE_NAME = "__acme-expo-redirect-state";
const AUTH_COOKIE_PATTERN = /authjs\.session-token=([^;]+)/;

/**
 * Auth bypass is used when the user has no other authentication method configured.
 * This is only to be used in dev with expo, this does not work with nextjs
 */
async function handleExpoAuthBypass(redirectURL: string) {
  (await cookies()).delete(EXPO_COOKIE_NAME);

  if (env.NODE_ENV !== "development") {
    throw new Error("NO AUTH BYPASS IN PROD!");
  }
  const defaultUser = await db
    .select()
    .from(user)
    .where(eq(user.name, "Test User"))
    .limit(1)
    .then(getFirstEl);

  if (!defaultUser) {
    throw new Error("No default user found :(");
  }

  const session = await adapter.createSession({
    sessionToken: randomUUID(),
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    userId: defaultUser.id,
  });

  const url = new URL(redirectURL);
  url.searchParams.set("session_token", session.sessionToken);

  return NextResponse.redirect(url);
}

/**
 * Noop in production.
 *
 * In development, rewrite the request URL to use localhost instead of host IP address
 * so that Expo Auth works without getting trapped by Next.js CSRF protection.
 * @param req The request to modify
 * @returns The modified request.
 */
function rewriteRequestUrlInDevelopment(req: NextRequest) {
  if (isSecureContext) return req;

  const host = req.headers.get("host");
  const newURL = new URL(req.url);
  newURL.host = host ?? req.nextUrl.host;
  return new NextRequest(newURL, req);
}

async function handleExpoSigninCallback(
  req: NextRequest,
  redirectURL: string,
) {
  // Run original handler, then extract the session token from the response
  // Send it back via a query param in the Expo deep link. The Expo app
  // will then get that and set it in the session storage.
  const authResponse = await handlers.POST(req);
  const setCookie = authResponse.headers
    .getSetCookie()
    .find((cookie) => AUTH_COOKIE_PATTERN.test(cookie));
  const match = setCookie?.match(AUTH_COOKIE_PATTERN)?.[1];

  if (!match)
    throw new Error(
      "Unable to find session cookie: " +
      JSON.stringify(authResponse.headers.getSetCookie()),
    );

  const url = new URL(redirectURL);
  url.searchParams.set("session_token", match);

  return NextResponse.redirect(url);
}

export const POST = async (
  _req: NextRequest,
  props: { params: { nextauth: string[] } },
) => {
  // First step must be to correct the request URL.
  const req = rewriteRequestUrlInDevelopment(_req);

  const isAuthBypass = req.nextUrl.searchParams.get("authBypass") === "true";
  const nextauthAction = props.params.nextauth[0];
  const isExpoCallback = (await cookies()).get(EXPO_COOKIE_NAME);

  if (isAuthBypass && isExpoCallback) {
    await handleExpoAuthBypass(isExpoCallback.value)
  }

  // callback handler required separately in the POST handler
  // since Apple sends a POST request instead of a GET
  if (nextauthAction === "callback" && !!isExpoCallback) {
    return handleExpoSigninCallback(req, isExpoCallback.value);
  }

  return handlers.POST(req);
};

export const GET = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  // First step must be to correct the request URL.
  const req = rewriteRequestUrlInDevelopment(_req);

  const isAuthBypass = req.nextUrl.searchParams.get("authBypass") === "true";
  const expoAuthBypassRedirect = req.nextUrl.searchParams.get("expo-redirect");
  const nextauthAction = (await props.params).nextauth[0];
  const isExpoSignIn = req.nextUrl.searchParams.get("expo-redirect");
  const isExpoCallback = (await cookies()).get(EXPO_COOKIE_NAME);

  if (nextauthAction === "signin" && !!isExpoSignIn) {
    // set a cookie we can read in the callback
    // to know to send the user back to expo
    (await cookies()).set({
      name: EXPO_COOKIE_NAME,
      value: isExpoSignIn,
      maxAge: 60 * 10, // 10 min
      path: "/",
    });
  }

  if (isAuthBypass && expoAuthBypassRedirect) {
    return await handleExpoAuthBypass(expoAuthBypassRedirect)
  }

  if (nextauthAction === "callback" && !!isExpoCallback) {
    return handleExpoSigninCallback(req, isExpoCallback.value);
  }

  // Every other request just calls the default handler
  return handlers.GET(req);
};
