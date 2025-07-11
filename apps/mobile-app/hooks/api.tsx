import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@acme/api";

import { getBaseUrl } from "./base-url";
import { getToken } from "./session-store";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

export const api = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
      colorMode: "ansi",
    }),
    httpBatchLink({
      transformer: superjson,
      url: `${getBaseUrl()}/api/trpc`,
      fetch(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      },
      async headers() {
        const headers = new Map<string, string>();
        headers.set("x-trpc-source", "expo-react");

        const token = await getToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);

        return Object.fromEntries(headers);
      },
    }),
  ],
});

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: api,
  queryClient,
});

export { type RouterInputs, type RouterOutputs } from "@acme/api";
