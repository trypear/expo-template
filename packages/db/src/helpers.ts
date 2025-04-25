import type { SQL, SQLWrapper } from "drizzle-orm";
import { eq } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Extracts the driver type from a column
 */
type ExtractDriverType<T> = T extends { _: { driverParam: infer D } }
	? D
	: T extends { _: { brand: "SQL.Aliased"; type: infer D } }
	? D
	: T extends SQL.Aliased<infer D>
	? D
	: never;

/**
 * Detects if a type is an SQL.Aliased
 */
type IsSQLAliased<T> = T extends SQL.Aliased<unknown> ? true : false;

type ValidColumnType = PgColumn | SQL.Aliased<unknown>;

/**
 * Checks if a type is a specific string template literal (not just any string)
 */
type IsTemplateLiteral<T> = T extends string
	? string extends T
	? false
	: true
	: false;

/**
 * Enhanced equality operator for comparing columns with prefix-awareness
 * Provides type safety when comparing columns that should have compatible prefixes
 */
export const eqi = <T extends ValidColumnType, U extends ValidColumnType | string>(
	left: T,
	right: U extends ValidColumnType
		? IsSQLAliased<U> extends true
		? IsTemplateLiteral<ExtractDriverType<T>> extends true
		? SQL.Aliased<string | ExtractDriverType<T>>
		: SQL.Aliased<ExtractDriverType<T>>
		: { _: { driverParam: ExtractDriverType<T> } }
		: string,
): SQL<unknown> => {
	return eq(left as SQLWrapper, right);
};