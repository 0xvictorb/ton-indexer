'use node';

import { internalAction, type ActionCtx } from './_generated/server';
import { api } from './_generated/api';
import { Address, Cell, type Transaction, loadTransaction } from '@ton/core';
import _ from 'lodash-es';
import type { BlockID } from "ton-lite-client";
import { loadInternalMsgBody, type InternalMsgBody } from '@/abi/stonfi';
import { loadExtOutMsgBody, type ExtOutMsgBody } from '@/abi/dedust';
import { tonClient } from '@/ton-client';

const transformObject = (obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const result: Record<string, unknown> = {}
  for (const i in obj as Record<string, unknown>) {
    const value = (obj as Record<string, unknown>)[i]
    
    if (Address.isAddress(value)) {
      result[i] = value.toString()
      continue
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const temp = transformObject(value) as Record<string, unknown>
      for (const j in temp) {
        result[`${i}.${j}`] = temp[j]
      }
    } else {
      try {
        result[i] = (value as any).toString()
      } catch {
        result[i] = JSON.stringify(value)
      }
    }
  }
  return result
}

export const processStonFiRouter = async (ctx: ActionCtx, { address, block }: { address: string, block: BlockID }) => {
    const accountState = await tonClient.getAccountState(Address.parse(address), block);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(accountState.lastTx!.hash.toString(16).padStart(64, '0'), 'hex');

    const transactionsRaw = await tonClient.getAccountTransactions(
      Address.parse(address),
      ltState,
      hashState,
      100
    );


    const transactions: Transaction[] = [];
    for (const trx of Cell.fromBoc(transactionsRaw.transactions)) {
      transactions.push(loadTransaction(trx.beginParse()));
    }

    for (const trx of transactions) {
      const inMessage = trx.inMessage;
      if (!inMessage || !(inMessage.info.src instanceof Address) || !inMessage.body) {
        continue;
      }

      const sender = inMessage.info.src;

      const outMessages = trx.outMessages.values();
      for (const outMessage of outMessages) {
        const slice = outMessage.body.beginParse();

        let payload: InternalMsgBody;
        try {
          payload = loadInternalMsgBody(slice);
        } catch (error) {
          console.log('SKIP: not a swap event', { hash: trx.hash().toString('hex') });
          continue;
        }

        const transaction = {
          hash: trx.hash().toString('hex'),
          block: block.seqno,
          timestamp: trx.now,
          contractName: 'stonfi' as const,
          from: sender.toString(),
          to: inMessage.info.dest?.toString(),
          payload: transformObject(payload),
        };

        await ctx.runMutation(api.transactions.saveTransaction, transaction);
      }
    }
  };

export const processDedustPool = async (ctx: ActionCtx, { address, block }: { address: string, block: BlockID }) => {
    const accountState = await tonClient.getAccountState(Address.parse(address), block);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(accountState.lastTx!.hash.toString(16).padStart(64, '0'), 'hex');

    const transactionsRaw = await tonClient.getAccountTransactions(
      Address.parse(address),
      ltState,
      hashState, 100);

    const transactions: Transaction[] = [];
    for (const trx of Cell.fromBoc(transactionsRaw.transactions)) {
      transactions.push(loadTransaction(trx.beginParse()));
    }

    for (const trx of transactions) {
      const inMessage = trx.inMessage;
      if (!inMessage) {
        continue;
      }

      const sender = inMessage.info.src;
      if (!(sender instanceof Address)) {
        continue;
      }

      const cellInMessage = inMessage.body;
      if (cellInMessage === undefined) {
        continue;
      }

      const outMessages = trx.outMessages.values();

      for (const outMessage of outMessages) {
        const slice = outMessage.body.beginParse();

        let payload: ExtOutMsgBody;
        try {
          payload = loadExtOutMsgBody(slice);
        } catch (error) {
          console.log('SKIP: not a swap event', trx.hash().toString('hex'));
          continue;
        }

        const transaction = {
          hash: trx.hash().toString('hex'),
          block: block.seqno,
          timestamp: trx.now,
          contractName: 'dedust' as const,
          from: sender.toString(),
          to: inMessage.info.dest?.toString(),
          payload: transformObject(payload),
        };

        await ctx.runMutation(api.transactions.saveTransaction, transaction);
      }
    }
  }
;

export const processUtyabPool = async (ctx: ActionCtx, { address, block }: { address: string, block: BlockID }) => {
    const accountState = await tonClient.getAccountState(Address.parse(address), block);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(accountState.lastTx!.hash.toString(16).padStart(64, '0'), 'hex');

    const transactionsRaw = await tonClient.getAccountTransactions(
      Address.parse(address),
      ltState,
      hashState, 100);

    const transactions: Transaction[] = [];
    for (const trx of Cell.fromBoc(transactionsRaw.transactions)) {
      transactions.push(loadTransaction(trx.beginParse()));
    }

    for (const trx of transactions) {
      const inMessage = trx.inMessage;
      if (!inMessage) {
        continue;
      }

      const sender = inMessage.info.src;
      if (!(sender instanceof Address)) {
        continue;
      }

      const cellInMessage = inMessage.body;
      if (cellInMessage === undefined) {
        continue;
      }

      const outMessages = trx.outMessages.values();

      for (const outMessage of outMessages) {
        const slice = outMessage.body.beginParse();

        let payload: ExtOutMsgBody;
        try {
          payload = loadExtOutMsgBody(slice);
        } catch (error) {
          console.log('SKIP: not a swap event', trx.hash().toString('hex'));
          continue;
        }

        const transaction = {
          hash: trx.hash().toString('hex'),
          block: block.seqno,
          timestamp: trx.now,
          contractName: 'utyab' as const,
          from: sender.toString(),
          to: inMessage.info.dest?.toString(),
          payload: transformObject(payload),
        };

        await ctx.runMutation(api.transactions.saveTransaction, transaction);
      }
    }
  }
;

export const parseBlockTransactions = internalAction({
  handler: async (ctx) => {
    const { last: lastBlock } = await tonClient.getMasterchainInfo();
    const watchAddresses = await ctx.runQuery(api.watchAddresses.getWatchAddresses, {});

    const processingTasks = watchAddresses.map(watchAddress => {
      switch (watchAddress.contractName) {
        case 'stonfi':
          return processStonFiRouter(ctx, {
            address: watchAddress.address,
            block: lastBlock
          });
        case 'dedust':
          return processDedustPool(ctx, {
            address: watchAddress.address,
            block: lastBlock
          });
        case 'utyab':
          return processUtyabPool(ctx, {
            address: watchAddress.address,
            block: lastBlock
          });
        default:
          return Promise.resolve(); // Handle unknown dex types
      }
    });

    await Promise.all(processingTasks);
  },
});
