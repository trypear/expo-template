import type {
	Adapter,
	AdapterAccount,
	AdapterSession,
	AdapterUser,
} from "@auth/core/adapters"
import type { Awaitable } from "@auth/core/types"
import type { Database } from "@acme/db/client"
import { eqi, getFirstEl, parseFirstEl, account, session, user, and } from "@acme/db"

export function CustomDrizzleAdapter(
	client: Database,
): Adapter {
	return {
		async createUser({ email, emailVerified, id, image, name }: AdapterUser) {
			return client
				.insert(user)
				.values({
					email,
					emailVerified,
					id,
					image,
					name,
				})
				.returning()
				.then(parseFirstEl) as Awaitable<AdapterUser>
		},
		async getUser(userId: string) {
			return client
				.select()
				.from(user)
				.where(eqi(user.id, userId))
				.then(getFirstEl) as Awaitable<AdapterUser | null>
		},
		async getUserByEmail(email: string) {
			return client
				.select()
				.from(user)
				.where(eqi(user.email, email))
				.then(getFirstEl) as Awaitable<AdapterUser | null>
		},
		async createSession(data: {
			sessionToken: string
			userId: string
			expires: Date
		}) {
			return client.insert(session).values(data).returning().then(parseFirstEl);
		},
		async getSessionAndUser(sessionToken: string) {
			return client
				.select()
				.from(session)
				.where(eqi(session.sessionToken, sessionToken))
				.innerJoin(user, eqi(user.id, session.userId))
				.then(getFirstEl) as Awaitable<{
					session: AdapterSession
					user: AdapterUser
				} | null>
		},
		async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
			if (!data.id) {
				throw new Error("No user id.")
			}

			return client
				.update(user)
				.set(data)
				.where(eqi(user.id, data.id))
				.returning()
				.then(parseFirstEl) as Awaitable<AdapterUser>
		},
		async updateSession(
			data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
		) {
			return client
				.update(session)
				.set(data)
				.where(eqi(session.sessionToken, data.sessionToken))
				.returning()
				.then(parseFirstEl) as Awaitable<AdapterSession>
		},
		async linkAccount(data: AdapterAccount) {
			await client.insert(account).values(data)
		},
		async getUserByAccount(
			accountData: Pick<AdapterAccount, "provider" | "providerAccountId">
		) {
			return client
				.select({
					user: user,
				})
				.from(account)
				.innerJoin(user, eqi(account.userId, user.id))
				.where(
					and(
						eqi(account.provider, accountData.provider),
						eqi(account.providerAccountId, accountData.providerAccountId)
					)
				)
				.then(getFirstEl)
				.then(x => (x !== null ? x.user : null)) as Awaitable<AdapterUser | null>
		},
		async deleteSession(sessionToken: string) {
			await client
				.delete(session)
				.where(eqi(session.sessionToken, sessionToken))
		},
		async deleteUser(id: string) {
			await client.delete(user).where(eqi(user.id, id))
		},
		async unlinkAccount(
			params: Pick<AdapterAccount, "provider" | "providerAccountId">
		) {
			await client
				.delete(account)
				.where(
					and(
						eqi(account.provider, params.provider),
						eqi(account.providerAccountId, params.providerAccountId)
					)
				)
		},
		async getAccount(providerAccountId: string, provider: string) {
			const result = await client
				.select({
					userId: account.userId,
					type: account.type,
					providerAccountId: account.providerAccountId,
					expires_at: account.expires_at,
					provider: account.provider,
				})
				.from(account)
				.where(
					and(
						eqi(account.provider, provider),
						eqi(account.providerAccountId, providerAccountId)
					)
				)
				.then(getFirstEl)

			if (!result) return null

			return {
				...result,
				expires_at: result.expires_at ?? undefined,
			} as Awaitable<AdapterAccount>;
		},
		// These methods are optional
		createAuthenticator: undefined,
		getAuthenticator: undefined,
		listAuthenticatorsByUserId: undefined,
		updateAuthenticatorCounter: undefined,
		createVerificationToken: undefined,
		useVerificationToken: undefined,
	}
}