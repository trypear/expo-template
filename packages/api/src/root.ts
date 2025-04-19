import { authRouter } from "./router/auth";
import { budgetRouter } from "./router/budget";
import { testRouter } from "./router/test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  budget: budgetRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
