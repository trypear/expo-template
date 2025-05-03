import { authRouter } from "./router/auth";
import { customerRouter } from "./router/customer";
import { exampleRouter } from "./router/example";
import { inventoryRouter } from "./router/inventory";
import { productRouter } from "./router/product";
import { saleRouter } from "./router/sale";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  example: exampleRouter,
  product: productRouter,
  inventory: inventoryRouter,
  customer: customerRouter,
  sale: saleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
