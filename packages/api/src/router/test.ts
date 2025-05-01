import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure, publicProcedure } from "../trpc";
import { account, count, eqi, user } from "@acme/db";


export const testRouter = {
	// Project endpoints
	getHello: publicProcedure.query(() => {
		return {
			hello: true,
		}
	}),
	getPrivateHello: protectedProcedure.query(() => {
		return {
			privateHello: true,
		}
	}),
	getAccountCount: protectedProcedure.query(({ ctx }) => {
		return ctx.db.select({
			count: count(account.id)
		}).from(account)
			.innerJoin(user, eqi(user.id, account.userId))
			.where(eqi(user.id, ctx.session.user.id))
	}),
} satisfies TRPCRouterRecord;