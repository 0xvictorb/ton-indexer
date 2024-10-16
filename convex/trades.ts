import { v } from "convex/values";
import { internalMutation, query, internalQuery } from "./_generated/server";
import { ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";

export const createTrades = internalMutation({
    args: {
        trades: v.array(v.object({
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
            status: v.optional(v.union(v.literal('success'), v.literal('failed'), v.literal('pending'), v.literal('unknown'))),
        })),
    },
    handler: async (ctx, args) => {
        await Promise.all(
            args.trades.map(trade => ctx.runMutation(internal.trades.createTrade, trade))
        );
    },
});


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
        status: v.optional(v.union(v.literal('success'), v.literal('failed'), v.literal('pending'), v.literal('unknown'))),
    },
    handler: async (ctx, args) => {
        const existingTrade = await ctx.db.query("trades").withIndex("by_hash", (q) => q.eq('hash', args.hash)).first();

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
            status: args.status,
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

        let tradesQuery;
        if (args.contractName) {
            tradesQuery = ctx.db.query("trades").withIndex("by_contractName", (q) =>
                q.eq("contractName", args.contractName!)
            );
        } else {
            tradesQuery = ctx.db.query("trades");
        }

        tradesQuery = tradesQuery.order(args.order ?? "desc");

        const { page, ...pagination } = await tradesQuery.paginate(args.paginationOpts);

        const filteredTrades = page.filter((trade) => {
            if (args.walletAddress) {
                return trade.sender === args.walletAddress || trade.receiver === args.walletAddress;
            }
            return true;
        });

        const tradesWithTokens = await Promise.all(filteredTrades.map(async (trade) => {
            const tokenIn = trade.tokenIn ? await ctx.db.get(trade.tokenIn) : null;
            const tokenOut = trade.tokenOut ? await ctx.db.get(trade.tokenOut) : null;
            return { ...trade, tokenIn, tokenOut };
        }));

        tradesWithTokens.sort((a, b) => args.order === "asc" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);

        return { ...pagination, page: tradesWithTokens };
    },
});

export const getTradesByContractName = query({
    args: {
        contractName: v.union(v.literal("stonfi"), v.literal("dedust"), v.literal("utyab")),
        secret: v.string(),
        from: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (args.secret !== process.env.SECRET) {
            throw new ConvexError("Unauthorized");
        }

        console.log('args', args);

        const trades = await ctx.db.query("trades")
            .withIndex("by_contractName", (q) =>
                q.eq('contractName', args.contractName).gte('_creationTime', args.from ?? 0)
            )
            .collect();

        console.log('trades', trades);

        const tradesWithTokens = await Promise.all(trades.map(async (trade) => {
            const tokenIn = trade.tokenIn ? await ctx.db.get(trade.tokenIn) : null;
            const tokenOut = trade.tokenOut ? await ctx.db.get(trade.tokenOut) : null;
            return { ...trade, tokenIn, tokenOut };
        }));

        return tradesWithTokens;
    },
});

export const _get = internalQuery({
    args: {
        hash: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("trades").withIndex("by_hash", (q) => q.eq("hash", args.hash)).first();
    },
});
