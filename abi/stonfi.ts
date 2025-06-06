/// <reference path="../global.d.ts" />

import { loadEither, storeEither, Coins, Maybe , loadCoins, loadMaybe, storeMaybe, storeCoins } from "./helper";

import { Builder } from '@ton/core'
import { Slice } from '@ton/core'
import { beginCell } from '@ton/core'
import { BitString } from '@ton/core'
import { Cell } from '@ton/core'
import { Address } from '@ton/core'
import { ExternalAddress } from '@ton/core'
import { Dictionary } from '@ton/core'
import { DictionaryValue } from '@ton/core'
export function bitLen(n: number) {
    return n.toString(2).length;
}

// swap_op#25938561 = SwapOP;

export interface SwapOP {
    readonly kind: 'SwapOP';
}

// swap$_ transferred_op:SwapOP token_wallet1:MsgAddress min_out:Grams to_address:MsgAddress ref_address:(Either MsgAddress MsgAddress) = DexPayload;

// provide_lp$_ transferred_op:ProvideLpOP token_wallet1:MsgAddress min_lp_out:Grams = DexPayload;

export type DexPayload = DexPayload_swap | DexPayload_provide_lp;

export interface DexPayload_swap {
    readonly kind: 'DexPayload_swap';
    readonly transferred_op: SwapOP;
    readonly token_wallet1: Address | ExternalAddress | null;
    readonly min_out: bigint;
    readonly to_address: Address | ExternalAddress | null;
    readonly ref_address: Either<Address | ExternalAddress | null, Address | ExternalAddress | null>;
}

export interface DexPayload_provide_lp {
    readonly kind: 'DexPayload_provide_lp';
    readonly transferred_op: ProvideLpOP;
    readonly token_wallet1: Address | ExternalAddress | null;
    readonly min_lp_out: bigint;
}

// provide_lp_op#fcf9e58f = ProvideLpOP;

export interface ProvideLpOP {
    readonly kind: 'ProvideLpOP';
}

// ref_bodycell$_ from_real_user:MsgAddress ref_address:MsgAddress = RefBodyCell;

export interface RefBodyCell {
    readonly kind: 'RefBodyCell';
    readonly from_real_user: Address | ExternalAddress | null;
    readonly ref_address: Address | ExternalAddress | null;
}

// swap#25938561 query_id:uint64 from_user:MsgAddress token_wallet:MsgAddress amount:Grams min_out:Grams ref_bodycell:(Either RefBodyCell ^RefBodyCell) = InternalMsgBody;

// pay_to#f93bb43f query_id:uint64 owner:MsgAddress exit_code:uint32 ref_coins_data:^RefCoinsData = InternalMsgBody;

export type InternalMsgBody = InternalMsgBody_swap | InternalMsgBody_pay_to;

export interface InternalMsgBody_swap {
    readonly kind: 'InternalMsgBody_swap';
    readonly query_id: number;
    readonly from_user: Address | ExternalAddress | null;
    readonly token_wallet: Address | ExternalAddress | null;
    readonly amount: bigint;
    readonly min_out: bigint;
    readonly ref_bodycell: Either<RefBodyCell, RefBodyCell>;
}

export interface InternalMsgBody_pay_to {
    readonly kind: 'InternalMsgBody_pay_to';
    readonly query_id: number;
    readonly owner: Address | ExternalAddress | null;
    readonly exit_code: number;
    readonly ref_coins_data: RefCoinsData;
}

// ref_coins_data$_ amount0_out:Grams token0_address:MsgAddress amount1_out:Grams token1_address:MsgAddress = RefCoinsData;

export interface RefCoinsData {
    readonly kind: 'RefCoinsData';
    readonly amount0_out: bigint;
    readonly token0_address: Address | ExternalAddress | null;
    readonly amount1_out: bigint;
    readonly token1_address: Address | ExternalAddress | null;
}

// swap_op#25938561 = SwapOP;

export function loadSwapOP(slice: Slice): SwapOP {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x25938561))) {
        slice.loadUint(32);
        return {
            kind: 'SwapOP',
        }

    }
    throw new Error('Expected one of "SwapOP" in loading "SwapOP", but data does not satisfy any constructor');
}

export function storeSwapOP(swapOP: SwapOP): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0x25938561, 32);
    })

}

// swap$_ transferred_op:SwapOP token_wallet1:MsgAddress min_out:Grams to_address:MsgAddress ref_address:(Either MsgAddress MsgAddress) = DexPayload;

// provide_lp$_ transferred_op:ProvideLpOP token_wallet1:MsgAddress min_lp_out:Grams = DexPayload;

export function loadDexPayload(slice: Slice): DexPayload {
    if (true) {
        let transferred_op: SwapOP = loadSwapOP(slice);
        let token_wallet1: Address | ExternalAddress | null = slice.loadAddressAny();
        let min_out: bigint = slice.loadCoins();
        let to_address: Address | ExternalAddress | null = slice.loadAddressAny();
        let ref_address: Either<Address | ExternalAddress | null, Address | ExternalAddress | null> = loadEither<Address | ExternalAddress | null, Address | ExternalAddress | null>(slice, ((slice: Slice) => {
            return slice.loadAddressAny()

        }), ((slice: Slice) => {
            return slice.loadAddressAny()

        }));
        return {
            kind: 'DexPayload_swap',
            transferred_op: transferred_op,
            token_wallet1: token_wallet1,
            min_out: min_out,
            to_address: to_address,
            ref_address: ref_address,
        }

    }
    if (true) {
        let transferred_op: ProvideLpOP = loadProvideLpOP(slice);
        let token_wallet1: Address | ExternalAddress | null = slice.loadAddressAny();
        let min_lp_out: bigint = slice.loadCoins();
        return {
            kind: 'DexPayload_provide_lp',
            transferred_op: transferred_op,
            token_wallet1: token_wallet1,
            min_lp_out: min_lp_out,
        }

    }
    throw new Error('Expected one of "DexPayload_swap", "DexPayload_provide_lp" in loading "DexPayload", but data does not satisfy any constructor');
}

export function storeDexPayload(dexPayload: DexPayload): (builder: Builder) => void {
    if ((dexPayload.kind == 'DexPayload_swap')) {
        return ((builder: Builder) => {
            storeSwapOP(dexPayload.transferred_op)(builder);
            builder.storeAddress(dexPayload.token_wallet1);
            builder.storeCoins(dexPayload.min_out);
            builder.storeAddress(dexPayload.to_address);
            storeEither<Address | ExternalAddress | null, Address | ExternalAddress | null>(dexPayload.ref_address, ((arg: Address | ExternalAddress | null) => {
                return ((builder: Builder) => {
                    builder.storeAddress(arg);
                })

            }), ((arg: Address | ExternalAddress | null) => {
                return ((builder: Builder) => {
                    builder.storeAddress(arg);
                })

            }))(builder);
        })

    }
    if ((dexPayload.kind == 'DexPayload_provide_lp')) {
        return ((builder: Builder) => {
            storeProvideLpOP(dexPayload.transferred_op)(builder);
            builder.storeAddress(dexPayload.token_wallet1);
            builder.storeCoins(dexPayload.min_lp_out);
        })

    }
    throw new Error('Expected one of "DexPayload_swap", "DexPayload_provide_lp" in loading "DexPayload", but data does not satisfy any constructor');
}

// provide_lp_op#fcf9e58f = ProvideLpOP;

export function loadProvideLpOP(slice: Slice): ProvideLpOP {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0xfcf9e58f))) {
        slice.loadUint(32);
        return {
            kind: 'ProvideLpOP',
        }

    }
    throw new Error('Expected one of "ProvideLpOP" in loading "ProvideLpOP", but data does not satisfy any constructor');
}

export function storeProvideLpOP(provideLpOP: ProvideLpOP): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0xfcf9e58f, 32);
    })

}

// ref_bodycell$_ from_real_user:MsgAddress ref_address:MsgAddress = RefBodyCell;

export function loadRefBodyCell(slice: Slice): RefBodyCell {
    let from_real_user: Address | ExternalAddress | null = slice.loadAddressAny();
    let ref_address: Address | ExternalAddress | null = slice.loadAddressAny();
    return {
        kind: 'RefBodyCell',
        from_real_user: from_real_user,
        ref_address: ref_address,
    }

}

export function storeRefBodyCell(refBodyCell: RefBodyCell): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeAddress(refBodyCell.from_real_user);
        builder.storeAddress(refBodyCell.ref_address);
    })

}

// swap#25938561 query_id:uint64 from_user:MsgAddress token_wallet:MsgAddress amount:Grams min_out:Grams ref_bodycell:(Either RefBodyCell ^RefBodyCell) = InternalMsgBody;

// pay_to#f93bb43f query_id:uint64 owner:MsgAddress exit_code:uint32 ref_coins_data:^RefCoinsData = InternalMsgBody;

export function loadInternalMsgBody(slice: Slice): InternalMsgBody {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x25938561))) {
        slice.loadUint(32);
        let query_id: number = slice.loadUint(64);
        let from_user: Address | ExternalAddress | null = slice.loadAddressAny();
        let token_wallet: Address | ExternalAddress | null = slice.loadAddressAny();
        let amount: bigint = slice.loadCoins();
        let min_out: bigint = slice.loadCoins();
        let ref_bodycell: Either<RefBodyCell, RefBodyCell> = loadEither<RefBodyCell, RefBodyCell>(slice, loadRefBodyCell, ((slice: Slice) => {
            let slice1 = slice.loadRef().beginParse(true);
            return loadRefBodyCell(slice1)

        }));
        return {
            kind: 'InternalMsgBody_swap',
            query_id: query_id,
            from_user: from_user,
            token_wallet: token_wallet,
            amount: amount,
            min_out: min_out,
            ref_bodycell: ref_bodycell,
        }

    }
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0xf93bb43f))) {
        slice.loadUint(32);
        let query_id: number = slice.loadUint(64);
        let owner: Address | ExternalAddress | null = slice.loadAddressAny();
        let exit_code: number = slice.loadUint(32);
        let slice1 = slice.loadRef().beginParse(true);
        let ref_coins_data: RefCoinsData = loadRefCoinsData(slice1);
        return {
            kind: 'InternalMsgBody_pay_to',
            query_id: query_id,
            owner: owner,
            exit_code: exit_code,
            ref_coins_data: ref_coins_data,
        }

    }
    throw new Error('Expected one of "InternalMsgBody_swap", "InternalMsgBody_pay_to" in loading "InternalMsgBody", but data does not satisfy any constructor');
}

export function storeInternalMsgBody(internalMsgBody: InternalMsgBody): (builder: Builder) => void {
    if ((internalMsgBody.kind == 'InternalMsgBody_swap')) {
        return ((builder: Builder) => {
            builder.storeUint(0x25938561, 32);
            builder.storeUint(internalMsgBody.query_id, 64);
            builder.storeAddress(internalMsgBody.from_user);
            builder.storeAddress(internalMsgBody.token_wallet);
            builder.storeCoins(internalMsgBody.amount);
            builder.storeCoins(internalMsgBody.min_out);
            storeEither<RefBodyCell, RefBodyCell>(internalMsgBody.ref_bodycell, storeRefBodyCell, ((arg: RefBodyCell) => {
                return ((builder: Builder) => {
                    let cell1 = beginCell();
                    storeRefBodyCell(arg)(cell1);
                    builder.storeRef(cell1);

                })

            }))(builder);
        })

    }
    if ((internalMsgBody.kind == 'InternalMsgBody_pay_to')) {
        return ((builder: Builder) => {
            builder.storeUint(0xf93bb43f, 32);
            builder.storeUint(internalMsgBody.query_id, 64);
            builder.storeAddress(internalMsgBody.owner);
            builder.storeUint(internalMsgBody.exit_code, 32);
            let cell1 = beginCell();
            storeRefCoinsData(internalMsgBody.ref_coins_data)(cell1);
            builder.storeRef(cell1);
        })

    }
    throw new Error('Expected one of "InternalMsgBody_swap", "InternalMsgBody_pay_to" in loading "InternalMsgBody", but data does not satisfy any constructor');
}

// ref_coins_data$_ amount0_out:Grams token0_address:MsgAddress amount1_out:Grams token1_address:MsgAddress = RefCoinsData;

export function loadRefCoinsData(slice: Slice): RefCoinsData {
    let amount0_out: bigint = slice.loadCoins();
    let token0_address: Address | ExternalAddress | null = slice.loadAddressAny();
    let amount1_out: bigint = slice.loadCoins();
    let token1_address: Address | ExternalAddress | null = slice.loadAddressAny();
    return {
        kind: 'RefCoinsData',
        amount0_out: amount0_out,
        token0_address: token0_address,
        amount1_out: amount1_out,
        token1_address: token1_address,
    }

}

export function storeRefCoinsData(refCoinsData: RefCoinsData): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeCoins(refCoinsData.amount0_out);
        builder.storeAddress(refCoinsData.token0_address);
        builder.storeCoins(refCoinsData.amount1_out);
        builder.storeAddress(refCoinsData.token1_address);
    })

}

