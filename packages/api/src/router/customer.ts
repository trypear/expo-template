import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import {
  and,
  count,
  customer,
  eqi,
  insertCustomerSchema,
  like,
  user,
} from "@acme/db";
import { assert, getFirstEl } from "@acme/utils";

import { protectedProcedure } from "../trpc";

export const customerRouter = {
  // Get all customers with filtering options
  getCustomers: protectedProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { searchTerm, limit, offset } = input;

      // Build the where conditions
      let whereClause;

      if (searchTerm) {
        whereClause = and(
          like(customer.name, `%${searchTerm}%`),
          // Add more search fields if needed
        );
      }

      // Get total count for pagination
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(customer)
        .where(whereClause);

      const totalCount = totalCountResult[0]?.count ?? 0;

      // Get customers
      const customers = await ctx.db
        .select({
          customer: customer,
          user: user,
        })
        .from(customer)
        .leftJoin(user, eqi(customer.userId, user.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(customer.name);

      return {
        customers,
        pagination: {
          totalCount,
          limit,
          offset,
        },
      };
    }),

  // Get a single customer by ID
  getCustomerById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          customer: customer,
          user: user,
        })
        .from(customer)
        .leftJoin(user, eqi(customer.userId, user.id))
        .where(eqi(customer.id, input.id));

      const customerData = getFirstEl(result);

      if (!customerData) {
        throw new Error("Customer not found");
      }

      return customerData;
    }),

  // Create a new customer
  createCustomer: protectedProcedure
    .input(insertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      // Insert the customer
      const [newCustomer] = await ctx.db
        .insert(customer)
        .values(input)
        .returning();

      return newCustomer;
    }),

  // Update an existing customer
  updateCustomer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertCustomerSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // Check if customer exists
      const existingCustomer = await ctx.db
        .select()
        .from(customer)
        .where(eqi(customer.id, id))
        .then(getFirstEl);

      assert(!!existingCustomer, "Customer not found");

      // Update the customer with type-safe data
      const updateData = {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.userId !== undefined && { userId: data.userId }),
      };

      const [updatedCustomer] = await ctx.db
        .update(customer)
        .set(updateData)
        .where(eqi(customer.id, id))
        .returning();

      return updatedCustomer;
    }),

  // Delete a customer
  deleteCustomer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if customer exists
      const existingCustomer = await ctx.db
        .select()
        .from(customer)
        .where(eqi(customer.id, input.id))
        .then(getFirstEl);

      assert(!!existingCustomer, "Customer not found");

      // Delete the customer
      await ctx.db.delete(customer).where(eqi(customer.id, input.id));

      return { success: true, id: input.id };
    }),

  // Link customer to user account
  linkCustomerToUser: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { customerId, userId } = input;

      // Check if customer exists
      const existingCustomer = await ctx.db
        .select()
        .from(customer)
        .where(eqi(customer.id, customerId))
        .then(getFirstEl);

      assert(!!existingCustomer, "Customer not found");

      // Check if user exists
      const existingUser = await ctx.db
        .select()
        .from(user)
        .where(eqi(user.id, userId))
        .then(getFirstEl);

      assert(!!existingUser, "User not found");

      // Update the customer with the user ID
      const [updatedCustomer] = await ctx.db
        .update(customer)
        .set({ userId })
        .where(eqi(customer.id, customerId))
        .returning();

      return updatedCustomer;
    }),

  // Get customer by user ID
  getCustomerByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          customer: customer,
        })
        .from(customer)
        .where(eqi(customer.userId, input.userId));

      return result;
    }),
} satisfies TRPCRouterRecord;
