import { internalQuery } from "./_generated/server";

export const getPools = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pools = await ctx.db
      .query("pools")
      .collect();

    return pools;
  },
});
