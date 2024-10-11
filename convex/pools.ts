import { internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const getPools = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pools = await ctx.db
      .query("pools")
      .collect();

    return pools;
  },
});

export const create = mutation({
  args: {
    address: v.string(),
    name: v.string(),
    secret: v.string(),
    contractName: v.union(v.literal('stonfi'), v.literal('dedust'), v.literal('utyab')),
  },
  handler: async (ctx, args) => {
    if (args.secret !== process.env.SECRET) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.insert("pools", args);
  },
});
