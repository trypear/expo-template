import { authRouter } from "./router/auth";
import { budgetRouter } from "./router/budget";
import { exampleRouter } from "./router/example";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  budget: budgetRouter,
  example: exampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
