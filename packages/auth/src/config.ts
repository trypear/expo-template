import type {
  NextAuthConfig,
  Session as NextAuthSession,
  User,
} from "next-auth";
import { skipCSRFCheck } from "@auth/core";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@acme/db/client";
import { env } from "../env";
import { CustomDrizzleAdapter } from "./drizzleAdapter";
import type { USER_ROLES } from "@acme/db";
import { eq, user } from "@acme/db";
import type { AdapterUser } from "next-auth/adapters";
import { getFirstEl } from "@acme/utils";

type BaseUser = User & { userRole: typeof USER_ROLES[number]; }

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & BaseUser;
  }
}

type CustomAdapterUser = AdapterUser & BaseUser;

const adapter = CustomDrizzleAdapter<CustomAdapterUser>(db);

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
  providers: [CredentialsProvider({
    name: "Credentials",
    // `credentials` is used to generate a form on the sign in page.
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      username: { label: "Name", type: "text", placeholder: "jsmith" },
      // password: { label: "Password", type: "password" }
    },
    async authorize(_credentials, _req) {
      if (env.NODE_ENV === "production") throw new Error("No credentials auth (with bypass) allowed in prod!");
      // For dev, we'll just accept any credentials
      const testUser = await db.select({
        id: user.id
      }).from(user).where(eq(user.name, 'Test User')).limit(1).then(getFirstEl);

      if (!testUser) {
        throw new Error("User with name 'Test User' is missing! Insert a user with the name 'Test User' into the database and try again");
      }

      return testUser;
    }
  })],
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
