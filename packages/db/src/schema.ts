import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable, fk, lower } from "./utils";

// Edit the type to add user roles for RBAC
export const USER_ROLES = ["user", "admin"] as const;

// Payment methods enum
export const PAYMENT_METHODS = [
  "cash",
  "credit_card",
  "debit_card",
  "mobile_payment",
  "online",
] as const;

// Sale status enum
export const SALE_STATUS = [
  "completed",
  "pending",
  "cancelled",
  "refunded",
] as const;

// *****_____*****_____*****_____*****_____*****_____*****_____
// DO NOT REMOVE OR RENAME, ONLY ADD TO THESE TABLES IF REQUIRED
// NEXT AUTH IS DEPENDENT ON THESE HAVING THESE GIVEN COLUMNS
// MAKE ALL EXTRA FIELDS OPTIONAL - OR HAVE DEFAULTS
// *****_____*****_____*****_____*****_____*****_____*****_____

export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
    userRole: varchar({ enum: USER_ROLES }).default("user"),
  },
  (t) => [uniqueIndex("user_email_idx").on(lower(t.email))],
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable(
  "session",
  {
    sessionToken: varchar({ length: 255 }).notNull(),
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
  },
  (t) => [index("session_token_idx").on(t.sessionToken)],
);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
// *****_____*****_____*****_____*****_____*****_____*****_____

// Store Sales Tracking Schema

// Category table for product organization
export const category = createTable(
  "category",
  {
    name: varchar({ length: 100 }).notNull(),
    description: text(),
  },
  (t) => [uniqueIndex("category_name_idx").on(t.name)],
);

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

// Product table for store items
export const product = createTable(
  "product",
  {
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    sku: varchar({ length: 50 }).notNull(),
    price: integer().notNull(), // Stored in cents/pence
    categoryId: fk("category_id", () => category, { onDelete: "set null" }),
    isActive: boolean().default(true).notNull(),
  },
  (t) => [
    uniqueIndex("product_sku_idx").on(t.sku),
    index("product_category_idx").on(t.categoryId),
  ],
);

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

// Customer table for buyer information
export const customer = createTable(
  "customer",
  {
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }),
    phone: varchar({ length: 50 }),
    address: text(),
    userId: fk("user_id", () => user, { onDelete: "set null" }),
  },
  (t) => [
    index("customer_email_idx").on(lower(t.email)),
    index("customer_user_idx").on(t.userId),
  ],
);

export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;

// Inventory table for stock tracking
export const inventory = createTable(
  "inventory",
  {
    productId: fk("product_id", () => product, {
      onDelete: "cascade",
    }).notNull(),
    quantity: integer().notNull().default(0),
    lastRestockDate: timestamp({ mode: "date", withTimezone: true }),
    locationCode: varchar({ length: 50 }).default("main"),
  },
  (t) => [
    uniqueIndex("inventory_product_location_idx").on(
      t.productId,
      t.locationCode,
    ),
    index("inventory_location_idx").on(t.locationCode),
  ],
);

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;

// Sale table for transaction records
export const sale = createTable(
  "sale",
  {
    customerId: fk("customer_id", () => customer, { onDelete: "set null" }),
    saleDate: timestamp({ mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    totalAmount: integer().notNull(), // Stored in cents/pence
    paymentMethod: varchar({ enum: PAYMENT_METHODS }).default("cash"),
    status: varchar({ enum: SALE_STATUS }).default("completed").notNull(),
    notes: text(),
  },
  (t) => [
    index("sale_customer_idx").on(t.customerId),
    index("sale_date_idx").on(t.saleDate),
  ],
);

export type Sale = typeof sale.$inferSelect;
export type NewSale = typeof sale.$inferInsert;

// SaleItem table for individual items in a sale
export const saleItem = createTable(
  "sale_item",
  {
    saleId: fk("sale_id", () => sale, { onDelete: "cascade" }).notNull(),
    productId: fk("product_id", () => product, {
      onDelete: "restrict",
    }).notNull(),
    quantity: integer().notNull().default(1),
    priceAtSale: integer().notNull(), // Price at time of sale in cents/pence
    discount: integer().default(0), // Discount amount in cents/pence
  },
  (t) => [
    index("sale_item_sale_idx").on(t.saleId),
    index("sale_item_product_idx").on(t.productId),
  ],
);

export type SaleItem = typeof saleItem.$inferSelect;
export type NewSaleItem = typeof saleItem.$inferInsert;
