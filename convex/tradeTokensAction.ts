'use node'

import { v } from 'convex/values'
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server"
import type { Doc } from "./_generated/dataModel";
import { Address } from '@ton/core';

type JettonOffchainInfo = {
    mintable: boolean;
    total_supply: string;
    admin: {
      address: string;
      name: string;
      is_scam: boolean;
      icon: string;
      is_wallet: boolean;
    };
    metadata: {
      address: string;
      name: string;
      symbol: string;
      decimals: string;
      image: string;
      description: string;
      social: string[][];
      websites: string[][];
      catalogs: string[][];
    };
    verification: string;
    holders_count: number;
  };
  

export const getOrCreateTradeToken = internalAction({
    args: {
        address: v.string(),
    },
    handler: async (ctx, args): Promise<Doc<'tradeTokens'> | null> => {
        const { address } = args;
        const rawAddress = Address.parse(address).toRawString();
        console.log('rawAddress', rawAddress, address);
        const tradeToken: Doc<'tradeTokens'> | null = await ctx.runQuery(internal.tradeTokens.get, { address: rawAddress });

        if (tradeToken) {
            return tradeToken;
        }

        const jettonInfoResponse = await fetch(`https://tonapi.io/v2/jettons/${address}`);
        const jettonInfo = (await jettonInfoResponse.json()) as JettonOffchainInfo;

        console.log('jettonInfo', jettonInfo);

        await ctx.runMutation(internal.tradeTokens.create, {
            address: rawAddress,
            name: jettonInfo.metadata.name,
            symbol: jettonInfo.metadata.symbol,
            decimals: parseInt(jettonInfo.metadata.decimals),
            image: jettonInfo.metadata.image,
            kind: 'jetton' as const,
        });

        const newTradeToken: Doc<'tradeTokens'> | null = await ctx.runQuery(internal.tradeTokens.get, { address: rawAddress });
        return newTradeToken;
    }
})
