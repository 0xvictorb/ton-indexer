import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const get = internalQuery({
  args: {
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.query("transactions").withIndex("by_hash", (q) => q.eq('hash', args.hash)).first();
    return transaction;
  },
});

export const getTransactionsByContractName = query({
  args: {
    contractName: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.secret !== process.env.SECRET) {
      throw new ConvexError("Unauthorized");
    }

    const transactions = await ctx.db.query("transactions").withIndex("by_contractName", (q) => q.eq('contractName', args.contractName)).collect();
    return transactions;
  },
});

export const saveTransaction = internalMutation({
  args: {
    hash: v.string(),
    block: v.number(),
    timestamp: v.number(),
    contractName: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
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
      contractName: args.contractName,
      from: args.from,
      to: args.to,
      payload: args.payload,
    });

    return transactionId;
  },
});
