import { authRouter } from "./router/auth";
import { budgetRouter } from "./router/budget";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  budget: budgetRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
