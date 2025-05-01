import { authRouter } from "./router/auth";
import { testRouter } from "./router/test";
import { attendanceRouter } from "./router/attendance";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  test: testRouter,
  attendance: attendanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
