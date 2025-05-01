import { authRouter } from "./router/auth";
import { communityRouter } from "./router/community";
import { postRouter } from "./router/post";
import { commentRouter } from "./router/comment";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  community: communityRouter,
  post: postRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
