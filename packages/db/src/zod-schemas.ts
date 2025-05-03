import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import {
  category,
  customer,
  inventory,
  PAYMENT_METHODS,
  product,
  sale,
  SALE_STATUS,
  saleItem,
} from "./schema";

const commonOmitFields = {
  id: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Category schemas
export const insertCategorySchema = createInsertSchema(category, {
  name: z.string().min(1).max(100),
  description: z.string().optional(),
}).omit(commonOmitFields);

export const selectCategorySchema = createSelectSchema(category);

// Product schemas
export const insertProductSchema = createInsertSchema(product, {
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sku: z.string().min(1).max(50),
  price: z.number().int().positive(),
  isActive: z.boolean().default(true),
}).omit(commonOmitFields);

export const selectProductSchema = createSelectSchema(product);

// Customer schemas
export const insertCustomerSchema = createInsertSchema(customer, {
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).omit(commonOmitFields);

export const selectCustomerSchema = createSelectSchema(customer);

// Inventory schemas
export const insertInventorySchema = createInsertSchema(inventory, {
  quantity: z.number().int().default(0),
  lastRestockDate: z.date().optional(),
  locationCode: z.string().max(50).default("main"),
}).omit(commonOmitFields);

export const selectInventorySchema = createSelectSchema(inventory);

// Sale schemas
export const insertSaleSchema = createInsertSchema(sale, {
  saleDate: z.date().default(() => new Date()),
  totalAmount: z.number().int().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cash"),
  status: z.enum(SALE_STATUS).default("completed"),
  notes: z.string().optional(),
}).omit(commonOmitFields);

export const selectSaleSchema = createSelectSchema(sale);

// SaleItem schemas
export const insertSaleItemSchema = createInsertSchema(saleItem, {
  quantity: z.number().int().positive().default(1),
  priceAtSale: z.number().int().positive(),
  discount: z.number().int().min(0).default(0),
}).omit(commonOmitFields);

export const selectSaleItemSchema = createSelectSchema(saleItem);
