import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm/sql";
import { sql } from "drizzle-orm/sql";

export function lower(email: AnyPgColumn): SQL {
	return sql`lower(${email})`;
}