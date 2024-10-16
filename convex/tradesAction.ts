'use node';

import { internalAction, type ActionCtx } from './_generated/server';
import { internal } from './_generated/api';
import { Address, Cell, type Transaction, loadTransaction } from '@ton/core';
import _ from 'lodash-es';
import type { BlockID } from "ton-lite-client";
import { loadInternalMsgBody, type InternalMsgBody_swap, type InternalMsgBody_pay_to } from '@/abi/stonfi';
import { loadExtOutMsgBody, type ExtOutMsgBody } from '@/abi/dedust';
import { loadSwapEvent, type SwapEvent } from '@/abi/utyab';
import { tonClient } from '@/ton-client';

const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

// Cache for token addresses
const tokenAddressCache = new Map<string, string>();


async function getOrCreateTradeToken(ctx: ActionCtx, address: string): Promise<string> {
    const cachedToken = tokenAddressCache.get(address);
    if (cachedToken) return cachedToken;

    const token = await ctx.runAction(internal.tradeTokensAction.getOrCreateTradeToken, { address });
    if (token) {
        tokenAddressCache.set(address, token._id);
        return token._id;
    }
    return '';
}

const findStatus = (obj: any): boolean => {
    if (typeof obj === 'object') {
        for (const key in obj) {
            if (key === 'success') {
                return Boolean(obj[key]);
            } else if (typeof obj[key] === 'object') {
                const result = findStatus(obj[key]);
                if (result === false) {
                    return false;
                }
            }
        }
    }
    return true;
};

const getTransactionBasicInfo = async (hash: string) => {
    const traces = await fetch(`https://tonapi.io/v2/traces/${hash}`);
    const tracesJson = await traces.json();

    const createdAtDates: number[] = [];
    const findCreatedAt = (obj: any) => {
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (key === 'created_at') {
                    createdAtDates.push(obj[key]);
                } else {
                    findCreatedAt(obj[key]);
                }
            }
        }
    };
    findCreatedAt(tracesJson);
    const isSuccess = findStatus(tracesJson);

    createdAtDates.sort((a, b) => a - b);
    const filteredCreatedAtDates = createdAtDates.filter(Boolean);
    return {
        start: filteredCreatedAtDates[0],
        end: filteredCreatedAtDates[filteredCreatedAtDates.length - 1],
        from: tracesJson.transaction?.account?.address,
        status: isSuccess ? 'success' as const : 'failed' as const,
    };
}

function uint256ToRawAddress(uint256: string): string {
    const bigIntValue = BigInt(uint256);

    let hexString = bigIntValue.toString(16).replace(/^0x/, '');

    hexString = hexString.padStart(64, '0');

    return `0:${hexString}`;
}

export const processStonFiPool = async (ctx: ActionCtx, { address, block }: { address: string, block: BlockID }) => {
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

        const outMessages = trx.outMessages.values();
        const sender = inMessage.info.src;
        const swapMessage = inMessage;
        const paymentMessage = _.nth(outMessages, 1);

        if (swapMessage && paymentMessage) {
            const sliceSwap = swapMessage.body.beginParse();
            const slicePayment = paymentMessage.body.beginParse();

            let payloadSwap: InternalMsgBody_swap;
            let payloadPayment: InternalMsgBody_pay_to;

            try {
                payloadSwap = loadInternalMsgBody(sliceSwap) as InternalMsgBody_swap;
                payloadPayment = loadInternalMsgBody(slicePayment) as InternalMsgBody_pay_to;
            } catch (error) {
                console.log('SKIP: not a swap event');
                continue;
            }

            const amount0Out = payloadPayment.ref_coins_data.amount0_out;
            const amount1Out = payloadPayment.ref_coins_data.amount1_out;

            let direction = 'in';
            if (amount1Out === 0n) {
                direction = 'out';
            }

            const amountIn = payloadSwap.amount.toString();
            const amountOut = direction === 'in' ? amount1Out.toString() : amount0Out.toString();

            const currentPoolInfo = await fetch(`https://api.ston.fi/v1/pools/${address}`).then(res => res.json());
            const reserveIn = direction === 'in' ? currentPoolInfo.pool.reserve0 : currentPoolInfo.pool.reserve1;
            const reserveOut = direction === 'in' ? currentPoolInfo.pool.reserve1 : currentPoolInfo.pool.reserve0;
            const tokenInAddress = direction === 'in' ? currentPoolInfo.pool.token0_address : currentPoolInfo.pool.token1_address;
            const tokenOutAddress = direction === 'in' ? currentPoolInfo.pool.token1_address : currentPoolInfo.pool.token0_address;

            const tradeTokenIn = tokenInAddress ? await ctx.runAction(internal.tradeTokensAction.getOrCreateTradeToken, { address: tokenInAddress }) : null;
            const tradeTokenOut = tokenOutAddress ? await ctx.runAction(internal.tradeTokensAction.getOrCreateTradeToken, { address: tokenOutAddress }) : null;

            const { start, end, from, status } = await getTransactionBasicInfo(trx.hash().toString('hex'));

            const transaction = {
                hash: trx.hash().toString('hex'),
                pool: address,
                tokenIn: tradeTokenIn?._id,
                tokenOut: tradeTokenOut?._id,
                amountIn: amountIn.toString(),
                amountOut: amountOut.toString(),
                reserveIn: reserveIn.toString(),
                reserveOut: reserveOut.toString(),
                block: block.seqno,
                timestamp: start,
                endTimestamp: end,
                contractName: 'stonfi' as const,
                sender: from ?? sender.toString(),
                receiver: inMessage.info.dest?.toString(),
                fee: trx.totalFees.coins.toString(),
                status,
            };

            await ctx.runMutation(internal.trades.createTrade, transaction);
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
                payload = loadExtOutMsgBody(slice) as ExtOutMsgBody;
            } catch (error) {
                console.log('SKIP: not a swap event', trx.hash().toString('hex'));
                continue;
            }

            const assetIn = payload.asset_in;
            const assetOut = payload.asset_out;

            const addressInAddress = assetIn.kind === 'Asset_jetton' ? uint256ToRawAddress(assetIn.address.toString()) : TON_ADDRESS;
            const addressOutAddress = assetOut.kind === 'Asset_jetton' ? uint256ToRawAddress(assetOut.address.toString()) : TON_ADDRESS;

            const tradeTokenIn = await ctx.runAction(internal.tradeTokensAction.getOrCreateTradeToken, { address: addressInAddress });
            const tradeTokenOut = await ctx.runAction(internal.tradeTokensAction.getOrCreateTradeToken, { address: addressOutAddress });
            const amountIn = payload.amount_in.grams;
            const amountOut = payload.amount_out.grams;
            const reserveIn = payload.reserve0.grams;
            const reserveOut = payload.reserve1.grams;

            const { start, end, from, status } = await getTransactionBasicInfo(trx.hash().toString('hex'));

            const transaction = {
                hash: trx.hash().toString('hex'),
                pool: address,
                tokenIn: tradeTokenIn?._id,
                tokenOut: tradeTokenOut?._id,
                amountIn: amountIn.toString(),
                amountOut: amountOut.toString(),
                reserveIn: reserveIn.toString(),
                reserveOut: reserveOut.toString(),
                block: block.seqno,
                timestamp: start,
                endTimestamp: end,
                contractName: 'dedust' as const,
                sender: from ?? sender.toString(),
                receiver: inMessage.info.dest?.toString(),
                fee: trx.totalFees.coins.toString(),
                status,
            };

            await ctx.runMutation(internal.trades.createTrade, transaction);
        }
    }
};

export const processUtyabPool = async (ctx: ActionCtx, { address, block }: { address: string, block: BlockID }) => {
    const accountState = await tonClient.getAccountState(Address.parse(address), block);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(accountState.lastTx!.hash.toString(16).padStart(64, '0'), 'hex');

    const transactionsRaw = await tonClient.getAccountTransactions(
        Address.parse(address),
        ltState,
        hashState, 100);

    const transactions: Transaction[] = Cell.fromBoc(transactionsRaw.transactions)
        .map(trx => loadTransaction(trx.beginParse()));


    const tradePromises = transactions.map(async (trx) => {
        const inMessage = trx.inMessage;
        if (!inMessage || !(inMessage.info.src instanceof Address) || !inMessage.body) {
            return null;
        }

        const outMessages = trx.outMessages.values();
        const sender = inMessage.info.src;

        for (const outMessage of outMessages) {
            const slice = outMessage.body.beginParse();

            let payload: SwapEvent;
            try {
                payload = loadSwapEvent(slice) as SwapEvent;
            } catch (error) {
                console.log('SKIP: not a swap event');
                continue;
            }

            console.log('process swap event', trx.hash().toString('hex'));

            const assetIn = payload.asset_in;
            const assetOut = payload.asset_out;

            const addressInAddress = assetIn.type === 1 ? uint256ToRawAddress(assetIn.address!.toString()) : TON_ADDRESS;
            const addressOutAddress = assetOut.type === 1 ? uint256ToRawAddress(assetOut.address!.toString()) : TON_ADDRESS;

            const [tradeTokenIn, tradeTokenOut, transactionInfo] = await Promise.all([
                getOrCreateTradeToken(ctx, addressInAddress),
                getOrCreateTradeToken(ctx, addressOutAddress),
                getTransactionBasicInfo(trx.hash().toString('hex'))
            ]);

            return {
                hash: trx.hash().toString('hex'),
                pool: address,
                tokenIn: tradeTokenIn,
                tokenOut: tradeTokenOut,
                amountIn: payload.amount_in.toString(),
                amountOut: payload.amount_out.toString(),
                reserveIn: payload.reserves.reserve_in.toString(),
                reserveOut: payload.reserves.reserve_out.toString(),
                block: block.seqno,
                timestamp: transactionInfo.start,
                endTimestamp: transactionInfo.end,
                contractName: 'utyab' as const,
                sender: transactionInfo.from ?? sender.toString(),
                receiver: inMessage.info.dest?.toString(),
                fee: trx.totalFees.coins.toString(),
                status: transactionInfo.status,
            };
        }
        return null;
    });

    const trades = (await Promise.all(tradePromises)).filter(trade => trade !== null);

    if (trades.length > 0) {
        await ctx.runMutation(internal.trades.createTrades, { trades: trades as any });
    }
};

export const parseBlockTransactions = internalAction({
    handler: async (ctx) => {
        const { last: lastBlock } = await tonClient.getMasterchainInfo();
        const pools = await ctx.runQuery(internal.pools.getPools, {});

        const processingTasks = pools.map(pool => {
            switch (pool.contractName) {
                case 'stonfi':
                    // return processStonFiPool(ctx, {
                    //     address: pool.address,
                    //     block: lastBlock
                    // });
                    return Promise.resolve();
                case 'dedust':
                    // return processDedustPool(ctx, {
                    //     address: pool.address,
                    //     block: lastBlock
                    // });
                    return Promise.resolve();
                case 'utyab':
                    return processUtyabPool(ctx, {
                        address: pool.address,
                        block: lastBlock
                    });
                default:
                    return Promise.resolve();
            }
        });

        await Promise.all(processingTasks);
    },
});
