import { relations } from "drizzle-orm";
import {
	account,
	session,
	user,
	category,
	product,
	customer,
	inventory,
	sale,
	saleItem
} from "./schema";

// NextAuth Relations
export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	customers: many(customer)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Store Sales Tracking Relations
export const categoryRelations = relations(category, ({ many }) => ({
	products: many(product)
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(category, { fields: [product.categoryId], references: [category.id] }),
	inventoryItems: many(inventory),
	saleItems: many(saleItem)
}));

export const customerRelations = relations(customer, ({ one, many }) => ({
	user: one(user, { fields: [customer.userId], references: [user.id] }),
	sales: many(sale)
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
	product: one(product, { fields: [inventory.productId], references: [product.id] })
}));

export const saleRelations = relations(sale, ({ one, many }) => ({
	customer: one(customer, { fields: [sale.customerId], references: [customer.id] }),
	items: many(saleItem)
}));

export const saleItemRelations = relations(saleItem, ({ one }) => ({
	sale: one(sale, { fields: [saleItem.saleId], references: [sale.id] }),
	product: one(product, { fields: [saleItem.productId], references: [product.id] })
}));