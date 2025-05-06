import { authRouter } from "./router/auth";
import { exampleRouter } from "./router/example";
import { announcementRouter } from "./router/announcement";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  example: exampleRouter,
  announcement: announcementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
