You are using a monorepo and dev is running.
You are developing a mobile app and will make changes under apps/mobile-app.
Import using the @acme/x convention and do not change the ts config.

If you ever get stuck with something potentially being undefined, do:
import { assert } from "@acme/utils";

assert(!!value, "value should be defined")

If you ever gets stuck, tell me where you are getting stuck, don't keep trying over and over again.
WHEN YOU HAVE FINISHED YOUR TASK, PLEASE RETURN.

## File: packages/db/src/schema.ts

```
import { uniqueIndex, index, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";

// Edit the type to add user roles for RBAC
export const USER_ROLES = ["user", "admin"] as const;

// *****_____*****_____*****_____*****_____*****_____*****_____
// DO NOT REMOVE OR RENAME, ONLY ADD TO THESE TABLES IF REQUIRED
// NEXT AUTH IS DEPENDENT ON THESE HAVING THESE GIVEN COLUMNS
// MAKE ALL EXTRA FIELDS OPTIONAL - OR HAVE DEFAULTS
// *****_____*****_____*****_____*****_____*****_____*****_____

export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
    userRole: varchar({ enum: USER_ROLES }).default("user"),
  },
  (t) => [
    uniqueIndex("user_email_idx").on(lower(t.email))
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId)
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable("session", {
  sessionToken: varchar({ length: 255 }).notNull(),
  userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    index("session_token_idx").on(t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
// *****_____*****_____*****_____*****_____*****_____*****_____
```

## File: packages/db/package.json

```
{
  "name": "@acme/db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    },
    "./client": {
      "types": "./dist/client.d.ts",
      "default": "./src/client.ts"
    },
    "./schema": {
      "types": "./dist/schema.d.ts",
      "default": "./src/schema.ts"
    }
  },
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc",
    "format": "prettier --check . --ignore-path ../../.gitignore",
    "lint": "eslint",
    "push": "pnpm with-env drizzle-kit push",
    "generate": "pnpm with-env drizzle-kit generate",
    "migrate": "pnpm with-env drizzle-kit migrate",
    "studio": "pnpm with-env drizzle-kit studio",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false",
    "with-env": "dotenv -e ../../.env --"
  },
  "dependencies": {
    "@acme/utils": "workspace:^",
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.41.0",
    "drizzle-zod": "^0.7.0",
    "pg": "^8.14.1",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "@types/pg": "^8.11.13",
    "dotenv-cli": "^8.0.0",
    "drizzle-kit": "^0.30.5",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@acme/prettier-config"
}

```

## File: packages/db/src/relations.ts

```
import { relations } from "drizzle-orm";
import { account, session, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const SessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));
```

## File: packages/api/package.json

```
{
  "name": "@acme/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    }
  },
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc",
    "format": "prettier --check . --ignore-path ../../.gitignore",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "@acme/auth": "workspace:*",
    "@acme/db": "workspace:*",
    "@acme/utils": "workspace:^",
    "@acme/validators": "workspace:*",
    "@trpc/server": "catalog:",
    "superjson": "2.2.2",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@acme/prettier-config"
}

```

## File: packages/api/src/root.ts

```
import { authRouter } from "./router/auth";
import { exampleRouter } from "./router/example";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  example: exampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

```

## File: packages/api/src/router/test.ts

```
import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "../trpc";


export const testRouter = {
	// Project endpoints
	getHello: publicProcedure.query(() => {
		return {
			hello: true,
		}
	}),
} satisfies TRPCRouterRecord;
```

## File: packages/api/src/router/auth.ts

```
import type { TRPCRouterRecord } from "@trpc/server";

import { invalidateSessionToken } from "@acme/auth";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  signOut: protectedProcedure.mutation(async (opts) => {
    if (!opts.ctx.token) {
      return { success: false };
    }
    await invalidateSessionToken(opts.ctx.token);
    return { success: true };
  }),
} satisfies TRPCRouterRecord;

```

## File: packages/utils/src/index.ts

```
export const name = "utils";

class AssertionError extends Error {
	constructor(message: string) {
		super(message);
		// Adding the stack info to error.
		// Inspired by: https://blog.dennisokeeffe.com/blog/2020-08-07-error-tracing-with-sentry-and-es6-classes
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AssertionError);
		} else {
			this.stack = new Error(message).stack;
		}
		this.name = "AssertionError";
	}
}

/**
 * Use this function to assert things as being true (and provide a nice error message)
 * @param condition to assert true
 * @param message the error message that appears when the condition is not true
 */
export function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new AssertionError(message);
	}
};

/**
 * Always returns a value, otherwise throws an error
 */
export const parseFirstEl = <T extends object>(x: T[]) => {
	const y = x[0];
	assert(!!y, "No first element found :(");

	return y;
}

/**
 * Returns first element or null
 */
export const getFirstEl = <T extends object>(x: T[] | null | undefined) => {
	return x?.[0] ?? null;
};
```

## File: apps/mobile-app/app/\_layout.tsx

```
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import "./styles.css";
import "react-native-reanimated";

import { AuthSplash } from "@/components/AuthSplash";
import { useUser } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TRPCProvider } from "@/providers/TRPCProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        console.error("splash screen load failed");
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TRPCProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={[
            styles.container,
            colorScheme === "dark"
              ? styles.darkContainer
              : styles.lightContainer,
          ]}
        >
          <RootLayoutContent />
        </View>
      </ThemeProvider>
    </TRPCProvider>
  );
}

function RootLayoutContent() {
  const user = useUser();

  if (user) {
    return (
      <>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  }

  return <AuthSplash />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
});

```

## File: apps/mobile-app/package.json

```
{
  "name": "@acme/mobile-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "dev": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest --watchAll",
    "lint": "expo lint"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "dependencies": {
    "@acme/utils": "workspace:^",
    "@expo/metro-config": "^0.19.12",
    "@expo/vector-icons": "^14.0.2",
    "@react-native-community/datetimepicker": "^8.3.0",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "@react-navigation/native": "^7.0.14",
    "@tanstack/react-query": "catalog:",
    "@trpc/client": "catalog:",
    "@trpc/server": "catalog:",
    "@trpc/tanstack-react-query": "catalog:",
    "expo": "~52.0.46",
    "expo-blur": "~14.0.3",
    "expo-constants": "~17.0.8",
    "expo-font": "~13.0.4",
    "expo-haptics": "~14.0.1",
    "expo-linear-gradient": "^14.0.2",
    "expo-linking": "~7.0.5",
    "expo-router": "~4.0.20",
    "expo-secure-store": "14.0.1",
    "expo-splash-screen": "~0.29.24",
    "expo-status-bar": "~2.0.1",
    "expo-symbols": "~0.2.2",
    "expo-system-ui": "~4.0.9",
    "expo-web-browser": "~14.0.2",
    "js-cookie": "^3.0.5",
    "nativewind": "~4.1.23",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-gifted-charts": "^1.4.60",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-web": "~0.19.13",
    "react-native-webview": "13.12.5",
    "superjson": "2.2.2"
  },
  "devDependencies": {
    "@acme/api": "workspace:*",
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tailwind-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "@babel/core": "^7.25.2",
    "@types/jest": "^29.5.12",
    "@types/js-cookie": "^3.0.6",
    "@types/react": "~18.3.12",
    "@types/react-test-renderer": "^18.3.0",
    "eslint": "catalog:",
    "jest": "^29.2.1",
    "jest-expo": "~52.0.6",
    "prettier": "catalog:",
    "react-test-renderer": "18.3.1",
    "tailwindcss": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@acme/prettier-config",
  "private": true
}

```
