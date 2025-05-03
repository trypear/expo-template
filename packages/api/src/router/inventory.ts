import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, eqi, gte, inventory, like, lte, product } from "@acme/db";
import { assert, getFirstEl } from "@acme/utils";

import { protectedProcedure, publicProcedure } from "../trpc";

export const inventoryRouter = {
  // Get inventory levels for all products with filtering options
  getInventory: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
        minQuantity: z.number().optional(),
        maxQuantity: z.number().optional(),
        locationCode: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        searchTerm,
        minQuantity,
        maxQuantity,
        locationCode,
        limit,
        offset,
      } = input;

      // Build the where conditions
      const whereConditions = [];

      if (searchTerm) {
        whereConditions.push(like(product.name, `%${searchTerm}%`));
      }

      if (minQuantity !== undefined) {
        whereConditions.push(gte(inventory.quantity, minQuantity));
      }

      if (maxQuantity !== undefined) {
        whereConditions.push(lte(inventory.quantity, maxQuantity));
      }

      if (locationCode) {
        whereConditions.push(eqi(inventory.locationCode, locationCode));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count for pagination
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(inventory)
        .innerJoin(product, eqi(inventory.productId, product.id))
        .where(whereClause);

      const totalCount = totalCountResult[0]?.count ?? 0;

      // Get inventory with product information
      const inventoryItems = await ctx.db
        .select({
          inventory: inventory,
          product: product,
        })
        .from(inventory)
        .innerJoin(product, eqi(inventory.productId, product.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(product.name);

      return {
        inventoryItems,
        pagination: {
          totalCount,
          limit,
          offset,
        },
      };
    }),

  // Get inventory for a specific product
  getProductInventory: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          inventory: inventory,
          product: product,
        })
        .from(inventory)
        .innerJoin(product, eqi(inventory.productId, product.id))
        .where(eqi(inventory.productId, input.productId));

      return result;
    }),

  // Update inventory quantity
  updateInventory: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        locationCode: z.string().default("main"),
        quantity: z.number().int(),
        lastRestockDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, locationCode, quantity, lastRestockDate } = input;

      // Check if inventory record exists
      const existingInventory = await ctx.db
        .select()
        .from(inventory)
        .where(
          and(
            eqi(inventory.productId, productId),
            eqi(inventory.locationCode, locationCode),
          ),
        )
        .then(getFirstEl);

      if (existingInventory) {
        // Update existing inventory
        const [updatedInventory] = await ctx.db
          .update(inventory)
          .set({
            quantity,
            ...(lastRestockDate && { lastRestockDate }),
          })
          .where(
            and(
              eqi(inventory.productId, productId),
              eqi(inventory.locationCode, locationCode),
            ),
          )
          .returning();

        return updatedInventory;
      } else {
        // Create new inventory record
        const [newInventory] = await ctx.db
          .insert(inventory)
          .values({
            productId,
            locationCode,
            quantity,
            ...(lastRestockDate && { lastRestockDate }),
          })
          .returning();

        return newInventory;
      }
    }),

  // Adjust inventory (add or subtract quantity)
  adjustInventory: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        locationCode: z.string().default("main"),
        adjustment: z.number().int(), // Positive for additions, negative for subtractions
        isRestock: z.boolean().default(false), // Whether this is a restock operation
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, locationCode, adjustment, isRestock } = input;

      // Check if inventory record exists
      const existingInventory = await ctx.db
        .select()
        .from(inventory)
        .where(
          and(
            eqi(inventory.productId, productId),
            eqi(inventory.locationCode, locationCode),
          ),
        )
        .then(getFirstEl);

      assert(!!existingInventory, "Inventory record not found");

      // Calculate new quantity
      const newQuantity = existingInventory.quantity + adjustment;

      // Ensure quantity doesn't go below zero
      if (newQuantity < 0) {
        throw new Error("Insufficient inventory");
      }

      // Update inventory
      const updateData = {
        quantity: newQuantity,
        ...(isRestock && adjustment > 0 && { lastRestockDate: new Date() }),
      };

      const [updatedInventory] = await ctx.db
        .update(inventory)
        .set(updateData)
        .where(
          and(
            eqi(inventory.productId, productId),
            eqi(inventory.locationCode, locationCode),
          ),
        )
        .returning();

      return updatedInventory;
    }),

  // Get low stock items (below specified threshold)
  getLowStockItems: protectedProcedure
    .input(
      z.object({
        threshold: z.number().int().default(10),
        locationCode: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { threshold, locationCode } = input;

      const whereConditions = [lte(inventory.quantity, threshold)];

      if (locationCode) {
        whereConditions.push(eqi(inventory.locationCode, locationCode));
      }

      const lowStockItems = await ctx.db
        .select({
          inventory: inventory,
          product: product,
        })
        .from(inventory)
        .innerJoin(product, eqi(inventory.productId, product.id))
        .where(and(...whereConditions))
        .orderBy(inventory.quantity);

      return lowStockItems;
    }),

  // Get available locations
  getLocations: publicProcedure.query(async ({ ctx }) => {
    const locations = await ctx.db
      .select({ locationCode: inventory.locationCode })
      .from(inventory)
      .groupBy(inventory.locationCode)
      .orderBy(inventory.locationCode);

    return locations.map((l) => l.locationCode);
  }),
} satisfies TRPCRouterRecord;
