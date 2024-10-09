import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createTrade = internalMutation({
    args: {
      hash: v.string(),
      pool: v.string(),
      tokenIn: v.optional(v.id("tradeTokens")),
      tokenOut: v.optional(v.id("tradeTokens")),
      amountIn: v.string(),
      amountOut: v.string(),
      reserveIn: v.string(),
      reserveOut: v.string(),
      block: v.number(),
      timestamp: v.number(),
      contractName: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
      sender: v.string(),
      receiver: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const existingTrade = await ctx.db.query("trades").filter((q) => q.eq(q.field("hash"), args.hash)).first();
        
      if (existingTrade) {
        return existingTrade._id;
      }
  
      const tradeId = await ctx.db.insert("trades", {
        hash: args.hash,
        pool: args.pool,
        block: args.block,
        timestamp: args.timestamp,
        contractName: args.contractName,
        sender: args.sender,
        receiver: args.receiver,
        tokenIn: args.tokenIn,
        tokenOut: args.tokenOut,
        amountIn: args.amountIn,
        amountOut: args.amountOut,
        reserveIn: args.reserveIn,
        reserveOut: args.reserveOut,
      });
  
      return tradeId;
    },
  });
  