import { z } from "zod";

export const ProductInfoSchema = z.object({
  productName: z.string().describe("Name of the product"),
  watts: z.number().describe("Power rating of the product in watts"),
  volts: z.number().describe("Voltage of the product in volts"),
  amps: z.number().describe("Amperage of the product in amps"),
  url: z.string().url().describe("URL of the product page"),
});

// const PowerRatingSchema = z.object({
//   watts: z.union([z.number(), z.literal("unknown")]),
//   volts: z.union([z.number(), z.literal("unknown")]),
//   amps: z.union([z.number(), z.literal("unknown")]),
// });

// export const ProductInfoSchema = z.object({
//   productName: z.string().describe("Name of the product"),
//   powerRating: PowerRatingSchema.describe("Power rating of the product"),
//   url: z.string().url().describe("URL of the product page"),
// });

export type ProductInfo = z.infer<typeof ProductInfoSchema>;
