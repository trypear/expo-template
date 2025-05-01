import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import * as relations from "./relations";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sql = neon(process.env.POSTGRES_URL!);

// Combine schema and relations
const dbSchema = { ...schema, ...relations };

export const db = drizzle({
  client: sql,
  schema: dbSchema,
  casing: "snake_case",
});

export type Database = typeof db;
