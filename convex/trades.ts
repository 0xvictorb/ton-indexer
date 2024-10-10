import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";

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
        fee: v.optional(v.string()),
        endTimestamp: v.optional(v.number()),
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
            fee: args.fee,
            endTimestamp: args.endTimestamp,
        });

        return tradeId;
    },
});

export const getAll = query({
    args: {
        secret: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.secret !== process.env.SECRET) {
            throw new ConvexError("Unauthorized");
        }

        return await ctx.db.query("trades").order("desc").collect();
    },
});

export const list = query({
    args: {
        secret: v.string(),
        paginationOpts: paginationOptsValidator,
        order: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
        contractName: v.optional(v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab"))),
        walletAddress: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.secret !== process.env.SECRET) {
            throw new ConvexError("Unauthorized");
        }

        let tradesQuery = ctx.db.query("trades")
            .filter((q) => args.contractName ? q.eq(q.field("contractName"), args.contractName) : true)
            .filter((q) => args.walletAddress ? q.or(q.eq(q.field("sender"), args.walletAddress), q.eq(q.field("receiver"), args.walletAddress)) : true)
            .order(args.order ?? "desc");


        const { page, ...pagination } = await tradesQuery.paginate(args.paginationOpts);

        const tradesWithTokens = await Promise.all(page.map(async (trade) => {
            const tokenIn = trade.tokenIn ? await ctx.db.get(trade.tokenIn) : null;
            const tokenOut = trade.tokenOut ? await ctx.db.get(trade.tokenOut) : null;
            return { ...trade, tokenIn, tokenOut };
        }));

        const sortedTrades = tradesWithTokens.sort((a, b) => {
            return args.order === "desc" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
        });

        return { ...pagination, page: sortedTrades };
    },
});

export const getTradesByContractName = query({
    args: {
        contractName: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
        secret: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.secret !== process.env.SECRET) {
            throw new ConvexError("Unauthorized");
        }

        return await ctx.db.query("trades").filter((q) => q.eq(q.field("contractName"), args.contractName)).collect();
    },
});
