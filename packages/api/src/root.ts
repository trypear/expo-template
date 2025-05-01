import { authRouter } from "./router/auth";
import { testRouter } from "./router/test";
import { factsRouter } from "./router/facts";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  test: testRouter,
  facts: factsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
