import { query } from "./_generated/server";

export const getWatchAddresses = query({
  args: {},
  handler: async (ctx) => {
    const watchAddresses = await ctx.db
      .query("watchAddresses")
      .collect();

    return watchAddresses;
  },
});
