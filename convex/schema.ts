import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    transactions: defineTable({
        hash: v.string(),
        block: v.number(),
        timestamp: v.number(),
        dex: v.union(v.literal('stonfi'), v.literal('dedust'), v.literal('utyab')),
        from: v.string(),
        to: v.optional(v.string()),
        payload: v.any(),
    })
        .index('by_block', ['block'])
        .index('by_timestamp', ['timestamp'])
        .index('by_from', ['from'])
        .index('by_to', ['to']),

    watchAddresses: defineTable({
        address: v.string(),
        name: v.string(),
        dex: v.union(v.literal('stonfi'), v.literal('dedust'), v.literal('utyab')),
    }),
});
