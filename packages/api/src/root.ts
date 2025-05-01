import { authRouter } from "./router/auth";
import { testRouter } from "./router/test";
import { notesRouter } from "./router/notes";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  test: testRouter,
  notes: notesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
