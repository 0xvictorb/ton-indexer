import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    pools: defineTable({
        address: v.string(),
        name: v.string(),
        contractName: v.union(v.literal('stonfi'), v.literal('dedust'), v.literal('utyab')),
    }),

    tradeTokens: defineTable({
        address: v.string(),
        name: v.string(),
        symbol: v.string(),
        image: v.string(),
        decimals: v.number(),
        kind: v.union(v.literal('jetton'), v.literal('native')),
    }).index('by_address', ['address']),

    trades: defineTable({
        hash: v.string(),
        pool: v.string(),
        tokenIn: v.optional(v.id('tradeTokens')),
        tokenOut: v.optional(v.id('tradeTokens')),
        amountIn: v.string(),
        amountOut: v.string(),
        reserveIn: v.string(),
        reserveOut: v.string(),
        block: v.number(),
        timestamp: v.number(),
        contractName: v.union(v.literal('stonfi'), v.literal('dedust'), v.literal('utyab')),
        sender: v.string(),
        receiver: v.optional(v.string()),
        fee: v.optional(v.string()),
        endTimestamp: v.optional(v.number()),
    })
        .index('by_hash', ['hash'])
        .index('by_contractName', ['contractName'])
        .index('by_contract_and_timestamp', ['contractName', 'timestamp'])
        .index('by_timestamp', ['timestamp']),
});
