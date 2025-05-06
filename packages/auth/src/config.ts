import type {
  NextAuthConfig,
  Session as NextAuthSession,
  User,
} from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { skipCSRFCheck } from "@auth/core";
import Discord from "next-auth/providers/discord";

import type { USER_ROLES } from "@acme/db";
import { db } from "@acme/db/client";

import { env } from "../env";
import { CustomDrizzleAdapter } from "./drizzleAdapter";

type BaseUser = User & { userRole: (typeof USER_ROLES)[number] };

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & BaseUser;
  }
}

type CustomAdapterUser = AdapterUser & BaseUser;

export const adapter = CustomDrizzleAdapter<CustomAdapterUser>(db);

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  // In development, we need to skip checks to allow Expo to work
  ...(!isSecureContext
    ? {
      skipCSRFCheck: skipCSRFCheck,
      trustHost: true,
    }
    : {}),
  secret: env.AUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ...(env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET
      ? [
        Discord({
          clientId: env.AUTH_DISCORD_ID,
          clientSecret: env.AUTH_DISCORD_SECRET,
        }),
      ]
      : []),
  ],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts))
        throw new Error("unreachable with session strategy");

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await adapter.getSessionAndUser?.(sessionToken);
  return session
    ? {
      user: {
        ...session.user,
      },
      expires: session.session.expires.toISOString(),
    }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  const sessionToken = token.slice("Bearer ".length);
  await adapter.deleteSession?.(sessionToken);
};
