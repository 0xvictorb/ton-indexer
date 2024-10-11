import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const get = internalQuery({
    args: {
        address: v.string(),
    },
    handler: async (ctx, args) => {
        const { address } = args;
        return await ctx.db.query('tradeTokens').withIndex('by_address', (q) => q.eq('address', address)).first();
    }
})

export const create = internalMutation({
    args: {
        address: v.string(),
        name: v.string(),
        symbol: v.string(),
        image: v.string(),
        decimals: v.number(),
        kind: v.union(v.literal('jetton'), v.literal('native')),
    },
    handler: async (ctx, args) => {
        const { address, name, symbol, image, decimals, kind } = args;
        const existingToken = await ctx.runQuery(internal.tradeTokens.get, { address });
        if (existingToken) {
            return null;
        }
        
        await ctx.db.insert('tradeTokens', { address, name, symbol, image, decimals, kind });
    }
})
