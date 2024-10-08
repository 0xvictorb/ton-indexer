import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.query("transactions").filter((q) => q.eq(q.field("hash"), args.hash)).first();
    return transaction;
  },
});

export const getTransactionsByDex = query({
  args: {
    dex: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db.query("transactions").filter((q) => q.eq(q.field("dex"), args.dex)).collect();
    return transactions;
  },
});

export const saveTransaction = mutation({
  args: {
    hash: v.string(),
    block: v.number(),
    timestamp: v.number(),
    dex: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
    from: v.string(),
    to: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existingTransaction = await ctx.db.query("transactions").filter((q) => q.eq(q.field("hash"), args.hash)).first();
    
    if (existingTransaction) {
      return existingTransaction._id;
    }

    const transactionId = await ctx.db.insert("transactions", {
      hash: args.hash,
      block: args.block,
      timestamp: args.timestamp,
      dex: args.dex,
      from: args.from,
      to: args.to,
      payload: args.payload,
    });

    return transactionId;
  },
});
