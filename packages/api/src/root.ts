import { authRouter } from "./router/auth";
import { announcementRouter } from "./router/announcement";
import { helpRequestRouter } from "./router/help-request";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  announcement: announcementRouter,
  helpRequest: helpRequestRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
