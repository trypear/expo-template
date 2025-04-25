/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { GeneratedColumnConfig } from "drizzle-orm";
import { and } from "drizzle-orm"
import type {
	PgColumn,
	PgTableWithColumns,
} from "drizzle-orm/pg-core"

import type {
	Adapter,
	AdapterAccount,
	AdapterSession,
	AdapterUser,
} from "@auth/core/adapters"
import type { Awaitable } from "@auth/core/types"
import type { Database } from "@acme/db/client"
import { eqi, getFirstEl, parseFirstEl, account, session, user } from "@acme/db"

export function CustomDrizzleAdapter(
	client: Database,
): Adapter {
	return {
		async createUser(data: AdapterUser) {
			return client
				.insert(user)
				.values(data)
				.returning({
					id: user.id,
					email: user.email,
					emailVerified: user.emailVerified
				})
				.then(parseFirstEl) satisfies Awaitable<AdapterUser>
		},
		async getUser(userId: string) {
			return client
				.select()
				.from(user)
				.where(eqi(user.id, userId))
				.then(getFirstEl) satisfies Awaitable<AdapterUser | null>
		},
		async getUserByEmail(email: string) {
			return client
				.select()
				.from(user)
				.where(eqi(user.email, email))
				.then(getFirstEl) satisfies Awaitable<AdapterUser | null>
		},
		async createSession(data: {
			sessionToken: string
			userId: string
			expires: Date
		}) {
			return client
				.insert(session)
				.values(data)
				.returning()
				.then(parseFirstEl) satisfies Awaitable<AdapterSession>
		},
		async getSessionAndUser(sessionToken: string) {
			return client
				.select({
					session,
					user,
				})
				.from(session)
				.where(eqi(session.sessionToken, sessionToken))
				.innerJoin(user, eqi(user.id, session.userId))
				.then(getFirstEl) satisfies Awaitable<{
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
				.then(parseFirstEl) satisfies Awaitable<AdapterUser>
		},
		async updateSession(
			data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
		) {
			return client
				.update(session)
				.set(data)
				.where(eqi(session.sessionToken, data.sessionToken))
				.returning()
				.then(parseFirstEl) satisfies Awaitable<AdapterSession>
		},
		async linkAccount(data: AdapterAccount) {
			const accountData = {
				...data,
				provideraccountId: data.providerAccountId
			}
			await client.insert(account).values(accountData)
		},
		async getUserByAccount(
			accountData: Pick<AdapterAccount, "provider" | "providerAccountId">
		) {
			return client
				.select({
					user,
				})
				.from(account)
				.innerJoin(user, eqi(account.userId, user.id))
				.where(
					and(
						eqi(account.provider, accountData.provider),
						eqi(account.provideraccountId, accountData.providerAccountId)
					)
				)
				.then(getFirstEl).then(x => (x !== null ? x.user : null)) satisfies Awaitable<AdapterUser | null>
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
						eqi(account.provideraccountId, params.providerAccountId)
					)
				)
		},
		async getAccount(providerAccountId: string, provider: string) {
			const result = await client
				.select({
					userId: account.userId,
					type: account.type,
					providerAccountId: account.provideraccountId,
					expires_at: account.expires_at,
					provider: account.provider,
				})
				.from(account)
				.where(
					and(
						eqi(account.provider, provider),
						eqi(account.provideraccountId, providerAccountId)
					)
				)
				.then(getFirstEl)

			if (!result) return null

			return {
				...result,
				expires_at: result.expires_at ?? undefined,
			} satisfies Awaitable<AdapterAccount>;
		},
		// These methods are optional - you can remove them if you don't need webauthn support
		createAuthenticator: undefined,
		getAuthenticator: undefined,
		listAuthenticatorsByUserId: undefined,
		updateAuthenticatorCounter: undefined,
		// These methods are optional - you can remove them if you don't need verification token support
		createVerificationToken: undefined,
		useVerificationToken: undefined,
	}
}

type DefaultPostgresColumn<
	T extends {
		data: string | number | boolean | Date
		dataType: "string" | "number" | "boolean" | "date"
		notNull: boolean
		isPrimaryKey?: boolean
		columnType:
		| "PgVarchar"
		| "PgText"
		| "PgBoolean"
		| "PgTimestamp"
		| "PgInteger"
		| "PgUUID"
		| "PgCustomColumn"
	},
> = PgColumn<{
	name: string
	isAutoincrement: boolean
	isPrimaryKey: T["isPrimaryKey"] extends true ? true : false
	hasRuntimeDefault: boolean
	generated: GeneratedColumnConfig<T["data"]> | undefined
	columnType: T["columnType"]
	data: T["data"]
	driverParam: string | number | boolean
	notNull: T["notNull"]
	hasDefault: boolean
	enumValues: string[] | undefined
	dataType: T["dataType"]
	tableName: string
}>

export type DefaultPostgresUsersTable = PgTableWithColumns<{
	name: string
	columns: {
		id: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText" | "PgUUID" | "PgCustomColumn"
			isPrimaryKey: true
			data: string
			notNull: true
			dataType: "string"
		}>
		name: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
			dataType: "string"
		}>
		email: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
			dataType: "string"
		}>
		emailVerified: DefaultPostgresColumn<{
			dataType: "date"
			columnType: "PgTimestamp"
			data: Date
			notNull: boolean
		}>
		image: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
	}
	dialect: "pg"
	schema: string | undefined
}>

export type DefaultPostgresAccountsTable = PgTableWithColumns<{
	name: string
	columns: {
		userId: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText" | "PgUUID" | "PgCustomColumn"
			data: string
			notNull: true
			dataType: "string"
		}>
		type: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: true
			dataType: "string"
		}>
		provider: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: true
			dataType: "string"
		}>
		providerAccountId: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: true
		}>
		refresh_token: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
		access_token: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
		expires_at: DefaultPostgresColumn<{
			dataType: "number"
			columnType: "PgInteger"
			data: number
			notNull: boolean
		}>
		token_type: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
		scope: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
		id_token: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
		session_state: DefaultPostgresColumn<{
			dataType: "string"
			columnType: "PgVarchar" | "PgText"
			data: string
			notNull: boolean
		}>
	}
	dialect: "pg"
	schema: string | undefined
}>

export type DefaultPostgresSessionsTable = PgTableWithColumns<{
	name: string
	columns: {
		sessionToken: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText"
			data: string
			isPrimaryKey: true
			notNull: true
			dataType: "string"
		}>
		userId: DefaultPostgresColumn<{
			columnType: "PgVarchar" | "PgText" | "PgUUID" | "PgCustomColumn"
			data: string
			notNull: true
			dataType: "string"
		}>
		expires: DefaultPostgresColumn<{
			dataType: "date"
			columnType: "PgTimestamp"
			data: Date
			notNull: true
		}>
	}
	dialect: "pg"
	schema: string | undefined
}>
