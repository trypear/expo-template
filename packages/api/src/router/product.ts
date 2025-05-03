import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { category, count, eqi, product, and, like, inventory, eq, insertProductSchema } from "@acme/db";
import { assert, getFirstEl } from "@acme/utils";

import { protectedProcedure, publicProcedure } from "../trpc";

export const productRouter = {
	// Get all products with optional filtering
	getProducts: publicProcedure
		.input(
			z.object({
				categoryId: z.string().optional(),
				searchTerm: z.string().optional(),
				includeInactive: z.boolean().default(false),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { categoryId, searchTerm, includeInactive, limit, offset } = input;

			// Build the where conditions
			const whereConditions = [];

			if (categoryId) {
				whereConditions.push(eqi(product.categoryId, categoryId));
			}

			if (searchTerm) {
				whereConditions.push(like(product.name, `%${searchTerm}%`));
			}

			if (!includeInactive) {
				whereConditions.push(eq(product.isActive, true));
			}

			const whereClause = whereConditions.length > 0
				? and(...whereConditions)
				: undefined;

			// Get total count for pagination
			const totalCountResult = await ctx.db
				.select({ count: count() })
				.from(product)
				.where(whereClause);

			const totalCount = totalCountResult[0]?.count ?? 0;

			// Get products with category information
			const products = await ctx.db
				.select({
					product: product,
					category: category,
				})
				.from(product)
				.leftJoin(category, eqi(product.categoryId, category.id))
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(product.name);

			return {
				products,
				pagination: {
					totalCount,
					limit,
					offset,
				},
			};
		}),

	// Get a single product by ID
	getProductById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const result = await ctx.db
				.select({
					product: product,
					category: category,
				})
				.from(product)
				.leftJoin(category, eqi(product.categoryId, category.id))
				.where(eqi(product.id, input.id));

			const productData = getFirstEl(result);

			if (!productData) {
				throw new Error("Product not found");
			}

			return productData;
		}),

	// Create a new product
	createProduct: protectedProcedure
		.input(insertProductSchema)
		.mutation(async ({ ctx, input }) => {
			// Insert the product
			const [newProduct] = await ctx.db
				.insert(product)
				.values(input)
				.returning();

			// Create initial inventory record with 0 quantity
			if (newProduct) {
				await ctx.db
					.insert(inventory)
					.values({
						productId: newProduct.id,
						quantity: 0,
						locationCode: "main",
					});
			}

			return newProduct;
		}),

	// Update an existing product
	updateProduct: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: insertProductSchema.partial(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;

			// Check if product exists
			const existingProduct = await ctx.db
				.select()
				.from(product)
				.where(eqi(product.id, id))
				.then(getFirstEl);

			assert(!!existingProduct, "Product not found");

			// Update the product with type-safe data
			const updateData = {
				...(data.name !== undefined && { name: data.name }),
				...(data.description !== undefined && { description: data.description }),
				...(data.sku !== undefined && { sku: data.sku }),
				...(data.price !== undefined && { price: data.price }),
				...(data.categoryId !== undefined && { categoryId: data.categoryId }),
				...(data.isActive !== undefined && { isActive: data.isActive }),
			};

			const [updatedProduct] = await ctx.db
				.update(product)
				.set(updateData)
				.where(eqi(product.id, id))
				.returning();

			return updatedProduct;
		}),

	// Delete a product (soft delete by setting isActive to false)
	deleteProduct: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Check if product exists
			const existingProduct = await ctx.db
				.select()
				.from(product)
				.where(eqi(product.id, input.id))
				.then(getFirstEl);

			assert(!!existingProduct, "Product not found");

			// Soft delete by setting isActive to false
			const [updatedProduct] = await ctx.db
				.update(product)
				.set({ isActive: false })
				.where(eqi(product.id, input.id))
				.returning();

			return updatedProduct;
		}),

	// Get all categories
	getCategories: publicProcedure
		.query(async ({ ctx }) => {
			return ctx.db
				.select()
				.from(category)
				.orderBy(category.name);
		}),

	// Create a new category
	createCategory: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newCategory] = await ctx.db
				.insert(category)
				.values(input)
				.returning();

			return newCategory;
		}),
} satisfies TRPCRouterRecord;