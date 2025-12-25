import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// External API Types for Frontend
export const DexScreenerResponseSchema = z.object({
  schemaVersion: z.string().optional(),
  pairs: z.array(z.object({
    chainId: z.string(),
    dexId: z.string(),
    url: z.string(),
    pairAddress: z.string(),
    baseToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
    quoteToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
    priceNative: z.string(),
    priceUsd: z.string().optional(),
    txns: z.object({
      m5: z.object({ buys: z.number(), sells: z.number() }),
      h1: z.object({ buys: z.number(), sells: z.number() }),
      h6: z.object({ buys: z.number(), sells: z.number() }),
      h24: z.object({ buys: z.number(), sells: z.number() }),
    }).optional(),
    volume: z.object({
      h24: z.number().optional(),
      h6: z.number().optional(),
      h1: z.number().optional(),
      m5: z.number().optional(),
    }).optional(),
    priceChange: z.object({
      m5: z.number().optional(),
      h1: z.number().optional(),
      h6: z.number().optional(),
      h24: z.number().optional(),
    }).optional(),
    liquidity: z.object({
      usd: z.number().optional(),
      base: z.number().optional(),
      quote: z.number().optional(),
    }).optional(),
    fdv: z.number().optional(),
    marketCap: z.number().optional(),
  })).optional()
});

export type DexScreenerResponse = z.infer<typeof DexScreenerResponseSchema>;

export const BagsClaimStatsSchema = z.object({
  totalClaimed: z.number().optional(),
  totalClaimedUsd: z.number().optional(),
});

export type BagsClaimStats = z.infer<typeof BagsClaimStatsSchema>;
