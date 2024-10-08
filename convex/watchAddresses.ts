import { internalQuery } from "./_generated/server";

export const getWatchAddresses = internalQuery({
  args: {},
  handler: async (ctx) => {
    const watchAddresses = await ctx.db
      .query("watchAddresses")
      .collect();

    return watchAddresses;
  },
});
