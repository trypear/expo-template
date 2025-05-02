import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { account, count, eqi, user } from "@acme/db";
import { assert, getFirstEl, parseFirstEl } from "@acme/utils";

import { protectedProcedure, publicProcedure } from "../trpc";

// EXAMPLE ROUTER - TO REMOVE
export const exampleRouter = {
	// Project endpoints
	getHello: publicProcedure.query(() => {
		return {
			hello: true,
		};
	}),
	getUserName: protectedProcedure.query(({ ctx }) => {
		return ctx.db
			.select({ name: user.name })
			.from(user)
			.where(eqi(user.id, ctx.session.user.id))
			.then(getFirstEl)
			.then((x) => x?.name);
	}),
	getUserAccounts: protectedProcedure.query(({ ctx }) => {
		return ctx.db
			.select({ accountCount: count(account.id) })
			.from(user)
			.innerJoin(account, eqi(user.id, account.userId))
			.where(eqi(user.id, ctx.session.user.id))
			// parse first el either returns the first element (if present) or null
			.then(parseFirstEl);
	}),
	updateUserAccounts: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				updatedAccount: z.array(
					z.object({ example: z.boolean(), email: z.string() }),
				),
			}),
		)
		.mutation(({ ctx, input }) => {
			return ctx.db.transaction(async (trx) => {
				// transaction should be used for complex, multi-db-call changes
				const accounts = await trx
					.select({ account })
					.from(user)
					// using eqi to make sure that these ids can match
					.innerJoin(account, eqi(account.userId, user.id))
					.where(eqi(user.id, ctx.session.user.id));

				const emailAccount = accounts.find((x) => x.account.type === "email");
				// If we can only sign in with email, it must be defined (example scenario)
				assert(!!emailAccount, "Email account must be defined");
				console.log(emailAccount.account, input);
				// TODO: whatever account operation

				return true;
			});
		}),
} satisfies TRPCRouterRecord;
