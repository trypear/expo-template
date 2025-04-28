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
		async createUser(data: AdapterUser) {
			return client
				.insert(user)
				.values(data)
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
			const { expires, sessionToken, userId } = data;

			await client.insert(session).values({
				expires,
				sessionToken,
				userId
			})

			// Construct the return object manually to avoid the mapping issue
			return {
				sessionToken,
				userId,
				expires,
			};
		},
		async getSessionAndUser(sessionToken: string) {
			// Make sure all columns are explicitly selected
			return client
				.select({
					session: session,
					user: user,
				})
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
			// Fix: use the correct property name providerAccountId with capital A
			await client.insert(account).values({
				...data,
				// Make sure column names match what's defined in your schema
				// If your column is indeed named provideraccountId (lowercase a), this mapping is needed
				providerAccountId: data.providerAccountId
			})
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
						// Fix: use the correct property name providerAccountId 
						// Match this to your actual column name in the database
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
						// Fix: use the correct property name
						eqi(account.providerAccountId, params.providerAccountId)
					)
				)
		},
		async getAccount(providerAccountId: string, provider: string) {
			const result = await client
				.select({
					userId: account.userId,
					type: account.type,
					// Make sure to use the correct column name
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