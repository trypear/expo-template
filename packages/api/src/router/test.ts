import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../trpc";

export const testRouter = {
  // Project endpoints
  getHello: publicProcedure.query(() => {
    return {
      hello: true,
    };
  }),
} satisfies TRPCRouterRecord;
