import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type {
  NewSale} from "@acme/db";
import {
  and,
  count,
  customer,
  eq,
  eqi,
  gte,
  inventory,
  lte,
  or,
  PAYMENT_METHODS,
  product,
  sale,
  SALE_STATUS,
  saleItem,
} from "@acme/db";
import { assert, getFirstEl } from "@acme/utils";

import { protectedProcedure } from "../trpc";

export const saleRouter = {
  // Get sales with filtering options
  getSales: protectedProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        paymentMethod: z.enum(PAYMENT_METHODS).optional(),
        status: z.enum(SALE_STATUS).optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        customerId,
        startDate,
        endDate,
        paymentMethod,
        status,
        minAmount,
        maxAmount,
        limit,
        offset,
      } = input;

      // Build the where conditions
      const whereConditions = [];

      if (customerId) {
        whereConditions.push(eqi(sale.customerId, customerId));
      }

      if (startDate) {
        whereConditions.push(gte(sale.saleDate, startDate));
      }

      if (endDate) {
        // Add one day to include the end date fully
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereConditions.push(lte(sale.saleDate, nextDay));
      }

      if (paymentMethod) {
        whereConditions.push(eqi(sale.paymentMethod, paymentMethod));
      }

      if (status) {
        whereConditions.push(eqi(sale.status, status));
      }

      if (minAmount !== undefined) {
        whereConditions.push(gte(sale.totalAmount, minAmount));
      }

      if (maxAmount !== undefined) {
        whereConditions.push(lte(sale.totalAmount, maxAmount));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count for pagination
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(sale)
        .where(whereClause);

      const totalCount = totalCountResult[0]?.count ?? 0;

      // Get sales with customer information
      const sales = await ctx.db
        .select({
          sale: sale,
          customer: customer,
        })
        .from(sale)
        .leftJoin(customer, eqi(sale.customerId, customer.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sale.saleDate);

      return {
        sales,
        pagination: {
          totalCount,
          limit,
          offset,
        },
      };
    }),

  // Get a single sale by ID with all items
  getSaleById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get the sale with customer information
      const saleResult = await ctx.db
        .select({
          sale: sale,
          customer: customer,
        })
        .from(sale)
        .leftJoin(customer, eqi(sale.customerId, customer.id))
        .where(eqi(sale.id, input.id));

      const saleData = getFirstEl(saleResult);

      if (!saleData) {
        throw new Error("Sale not found");
      }

      // Get all items in the sale with product information
      const saleItems = await ctx.db
        .select({
          saleItem: saleItem,
          product: product,
        })
        .from(saleItem)
        .innerJoin(product, eqi(saleItem.productId, product.id))
        .where(eqi(saleItem.saleId, input.id));

      return {
        ...saleData,
        items: saleItems,
      };
    }),

  // Create a new sale with items
  createSale: protectedProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        paymentMethod: z.enum(PAYMENT_METHODS).default("cash"),
        status: z.enum(SALE_STATUS).default("completed"),
        notes: z.string().optional(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              quantity: z.number().int().positive(),
              priceAtSale: z.number().int().positive().optional(), // If not provided, use current product price
              discount: z.number().int().min(0).default(0),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (trx) => {
        const { customerId, paymentMethod, status, notes, items } = input;

        // Validate all products exist and get their prices
        const productIds = items.map((item) => item.productId);
        const products = await trx
          .select()
          .from(product)
          .where(
            and(
              or(...productIds.map((id) => eqi(product.id, id))),
              eq(product.isActive, true),
            ),
          );

        // Ensure all products were found
        if (products.length !== productIds.length) {
          throw new Error("One or more products not found or inactive");
        }

        // Check inventory for all products
        const inventoryItems = await trx
          .select()
          .from(inventory)
          .where(or(...productIds.map((id) => eqi(inventory.productId, id))));

        // Create a map of product ID to inventory
        const inventoryMap = new Map();
        for (const inv of inventoryItems) {
          inventoryMap.set(inv.productId, inv);
        }

        // Check if we have enough inventory for all items
        for (const item of items) {
          const inv = inventoryMap.get(item.productId);
          if (!inv || inv.quantity < item.quantity) {
            throw new Error(
              `Insufficient inventory for product ID ${item.productId}`,
            );
          }
        }

        // Create a map of product ID to product
        const productMap = new Map();
        for (const prod of products) {
          productMap.set(prod.id, prod);
        }

        // Calculate total amount and prepare sale items
        let totalAmount = 0;
        const saleItemsData = items.map((item) => {
          const prod = productMap.get(item.productId);
          const priceAtSale = item.priceAtSale ?? prod.price;
          const lineTotal = priceAtSale * item.quantity - item.discount;
          totalAmount += lineTotal;

          return {
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: priceAtSale,
            discount: item.discount,
          };
        });

        // Create the sale with proper type handling
        // Create a base object with required fields
        const baseValues = {
          totalAmount,
          paymentMethod,
          status,
          saleDate: new Date(),
          customerId,
          notes,
        } satisfies NewSale;

        const [newSale] = await trx.insert(sale).values(baseValues).returning();

        // Create the sale items
        const saleItemsWithId = newSale
          ? saleItemsData.map((item) => ({
              ...item,
              saleId: newSale.id,
            }))
          : [];

        await trx.insert(saleItem).values(saleItemsWithId);

        // Update inventory for all items
        for (const item of items) {
          const inv = inventoryMap.get(item.productId);
          await trx
            .update(inventory)
            .set({ quantity: inv.quantity - item.quantity })
            .where(eqi(inventory.id, inv.id));
        }

        return {
          ...newSale,
          items: saleItemsWithId,
        };
      });
    }),

  // Update sale status
  updateSaleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(SALE_STATUS),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, notes } = input;

      // Check if sale exists
      const existingSale = await ctx.db
        .select()
        .from(sale)
        .where(eqi(sale.id, id))
        .then(getFirstEl);

      assert(!!existingSale, "Sale not found");

      // Handle inventory adjustments for cancellations or refunds
      if (
        (status === "cancelled" || status === "refunded") &&
        existingSale.status === "completed"
      ) {
        return ctx.db.transaction(async (trx) => {
          // Get all items in the sale
          const saleItems = await trx
            .select()
            .from(saleItem)
            .where(eqi(saleItem.saleId, id));

          // Return items to inventory
          for (const item of saleItems) {
            // Get current inventory
            const inventoryItem = await trx
              .select()
              .from(inventory)
              .where(eqi(inventory.productId, item.productId))
              .then(getFirstEl);

            if (inventoryItem) {
              // Update inventory
              await trx
                .update(inventory)
                .set({ quantity: inventoryItem.quantity + item.quantity })
                .where(eqi(inventory.id, inventoryItem.id));
            }
          }

          // Update sale status
          let updatedNotes: string | null = existingSale.notes;
          if (notes && typeof notes === "string") {
            updatedNotes = existingSale.notes
              ? existingSale.notes + "\n" + notes
              : notes;
          }

          const [updatedSale] = await trx
            .update(sale)
            .set({
              status,
              notes: updatedNotes,
            })
            .where(eqi(sale.id, id))
            .returning();

          return updatedSale;
        });
      } else {
        // Simple status update without inventory changes
        let updatedNotes: string | null = existingSale.notes;
        if (notes && typeof notes === "string") {
          updatedNotes = existingSale.notes
            ? existingSale.notes + "\n" + notes
            : notes;
        }

        const [updatedSale] = await ctx.db
          .update(sale)
          .set({
            status,
            notes: updatedNotes,
          })
          .where(eqi(sale.id, id))
          .returning();

        return updatedSale;
      }
    }),

  // Get sales summary by date range
  getSalesSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, groupBy } = input;

      // Add one day to include the end date fully
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // This is a simplified approach - in a real application, you would use
      // database-specific date functions for proper grouping
      const sales = await ctx.db
        .select({
          saleDate: sale.saleDate,
          totalAmount: sale.totalAmount,
          status: sale.status,
        })
        .from(sale)
        .where(
          and(
            gte(sale.saleDate, startDate),
            lte(sale.saleDate, nextDay),
            eqi(sale.status, "completed"),
          ),
        )
        .orderBy(sale.saleDate);

      // Group sales by the specified interval
      const groupedSales = new Map();

      for (const s of sales) {
        let groupKey;
        const date = new Date(s.saleDate);

        if (groupBy === "day") {
          groupKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        } else if (groupBy === "week") {
          // Get the week number
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear =
            (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNum = Math.ceil(
            (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
          );
          groupKey = `${date.getFullYear()}-W${weekNum}`;
        } else if (groupBy === "month") {
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!groupedSales.has(groupKey)) {
          groupedSales.set(groupKey, {
            period: groupKey,
            totalSales: 0,
            saleCount: 0,
          });
        }

        const group = groupedSales.get(groupKey);
        group.totalSales += s.totalAmount;
        group.saleCount += 1;
      }

      return Array.from(groupedSales.values());
    }),

  // Get top selling products
  getTopSellingProducts: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, limit } = input;

      // Build the where conditions for sales
      const whereConditions = [eqi(sale.status, "completed")];

      if (startDate) {
        whereConditions.push(gte(sale.saleDate, startDate));
      }

      if (endDate) {
        // Add one day to include the end date fully
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereConditions.push(lte(sale.saleDate, nextDay));
      }

      const saleWhereClause = and(...whereConditions);

      // Get all completed sales in the date range
      const sales = await ctx.db
        .select({ id: sale.id })
        .from(sale)
        .where(saleWhereClause);

      if (sales.length === 0) {
        return [];
      }

      // Get all sale items for these sales
      const saleIds = sales.map((s) => s.id);

      // This query gets the top selling products by quantity
      const topProducts = await ctx.db
        .select({
          productId: saleItem.productId,
          product: product,
          totalQuantity: count(saleItem.id),
          totalRevenue: count(saleItem.priceAtSale),
        })
        .from(saleItem)
        .innerJoin(product, eqi(saleItem.productId, product.id))
        .where(or(...saleIds.map((id) => eqi(saleItem.saleId, id))))
        .groupBy(saleItem.productId, product.id)
        .orderBy(count(saleItem.id))
        .limit(limit);

      return topProducts;
    }),
} satisfies TRPCRouterRecord;
