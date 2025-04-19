import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sql = neon(process.env.POSTGRES_URL!);

export const db = drizzle({
  client: sql,
  schema,
  casing: "snake_case",
});

export type Database = typeof db;
