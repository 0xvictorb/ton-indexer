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

// create_vault#21cfe02b query_id:uint64 asset:Asset = InMsgBody;

// create_volatile_pool#97d51f2f query_id:uint64 asset0:Asset asset1:Asset = InMsgBody;

// swap#ea06185d query_id:uint64 amount:Coins _:SwapStep swap_params:^SwapParams = InMsgBody;

export type InMsgBody = InMsgBody_create_vault | InMsgBody_create_volatile_pool | InMsgBody_swap;

export interface InMsgBody_create_vault {
    readonly kind: 'InMsgBody_create_vault';
    readonly query_id: number;
    readonly asset: Asset;
}

export interface InMsgBody_create_volatile_pool {
    readonly kind: 'InMsgBody_create_volatile_pool';
    readonly query_id: number;
    readonly asset0: Asset;
    readonly asset1: Asset;
}

export interface InMsgBody_swap {
    readonly kind: 'InMsgBody_swap';
    readonly query_id: number;
    readonly amount: Coins;
    readonly _: SwapStep;
    readonly swap_params: SwapParams;
}

// native$0000 = Asset;

// jetton$0001 workchain_id:int8 address:uint256 = Asset;

// extra_currency$0010 currency_id:int32 = Asset;

export type Asset = Asset_native | Asset_jetton | Asset_extra_currency;

export interface Asset_native {
    readonly kind: 'Asset_native';
}

export interface Asset_jetton {
    readonly kind: 'Asset_jetton';
    readonly workchain_id: number;
    readonly address: bigint;
}

export interface Asset_extra_currency {
    readonly kind: 'Asset_extra_currency';
    readonly currency_id: number;
}

// timestamp#_ _:uint32 = Timestamp;

export interface Timestamp {
    readonly kind: 'Timestamp';
    readonly _: number;
}

// given_in$0 = SwapKind;

// given_out$1 = SwapKind;

export type SwapKind = SwapKind_given_in | SwapKind_given_out;

export interface SwapKind_given_in {
    readonly kind: 'SwapKind_given_in';
}

export interface SwapKind_given_out {
    readonly kind: 'SwapKind_given_out';
}

/*
swap_params#_ deadline:Timestamp recipient_addr:MsgAddressInt referral_addr:MsgAddress
              fulfill_payload:(Maybe ^Cell) reject_payload:(Maybe ^Cell) = SwapParams;
*/

export interface SwapParams {
    readonly kind: 'SwapParams';
    readonly deadline: Timestamp;
    readonly recipient_addr: Address;
    readonly referral_addr: Address | ExternalAddress | null;
    readonly fulfill_payload: Maybe<Cell>;
    readonly reject_payload: Maybe<Cell>;
}

// step#_ pool_addr:MsgAddressInt params:SwapStepParams = SwapStep;

export interface SwapStep {
    readonly kind: 'SwapStep';
    readonly pool_addr: Address;
    readonly params: SwapStepParams;
}

// step_params#_ kind:SwapKind limit:Coins next:(Maybe ^SwapStep) = SwapStepParams;

export interface SwapStepParams {
    readonly kind: 'SwapStepParams';
    readonly kind: SwapKind;
    readonly limit: Coins;
    readonly next: Maybe<SwapStep>;
}

// volatile$0 = PoolType;

// stable$1 = PoolType;

export type PoolType = PoolType_volatile | PoolType_stable;

export interface PoolType_volatile {
    readonly kind: 'PoolType_volatile';
}

export interface PoolType_stable {
    readonly kind: 'PoolType_stable';
}

// pool_params#_ pool_type:PoolType asset0:Asset asset1:Asset = PoolParams;

export interface PoolParams {
    readonly kind: 'PoolParams';
    readonly pool_type: PoolType;
    readonly asset0: Asset;
    readonly asset1: Asset;
}

// swap#e3a0d482 _:SwapStep swap_params:^SwapParams = ForwardPayload;

export interface ForwardPayload {
    readonly kind: 'ForwardPayload';
    readonly _: SwapStep;
    readonly swap_params: SwapParams;
}

/*
swap#9c610de3 asset_in:Asset asset_out:Asset amount_in:Coins amount_out:Coins
              ^[ sender_addr:MsgAddressInt referral_addr:MsgAddress
              reserve0:Coins reserve1:Coins ] = ExtOutMsgBody;
*/

export interface ExtOutMsgBody {
    readonly kind: 'ExtOutMsgBody';
    readonly asset_in: Asset;
    readonly asset_out: Asset;
    readonly amount_in: Coins;
    readonly amount_out: Coins;
    readonly sender_addr: Address;
    readonly referral_addr: Address | ExternalAddress | null;
    readonly reserve0: Coins;
    readonly reserve1: Coins;
}

// create_vault#21cfe02b query_id:uint64 asset:Asset = InMsgBody;

// create_volatile_pool#97d51f2f query_id:uint64 asset0:Asset asset1:Asset = InMsgBody;

// swap#ea06185d query_id:uint64 amount:Coins _:SwapStep swap_params:^SwapParams = InMsgBody;

export function loadInMsgBody(slice: Slice): InMsgBody {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x21cfe02b))) {
        slice.loadUint(32);
        let query_id: number = slice.loadUint(64);
        let asset: Asset = loadAsset(slice);
        return {
            kind: 'InMsgBody_create_vault',
            query_id: query_id,
            asset: asset,
        }

    }
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x97d51f2f))) {
        slice.loadUint(32);
        let query_id: number = slice.loadUint(64);
        let asset0: Asset = loadAsset(slice);
        let asset1: Asset = loadAsset(slice);
        return {
            kind: 'InMsgBody_create_volatile_pool',
            query_id: query_id,
            asset0: asset0,
            asset1: asset1,
        }

    }
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0xea06185d))) {
        slice.loadUint(32);
        let query_id: number = slice.loadUint(64);
        let amount: Coins = loadCoins(slice);
        let _: SwapStep = loadSwapStep(slice);
        let slice1 = slice.loadRef().beginParse(true);
        let swap_params: SwapParams = loadSwapParams(slice1);
        return {
            kind: 'InMsgBody_swap',
            query_id: query_id,
            amount: amount,
            _: _,
            swap_params: swap_params,
        }

    }
    throw new Error('Expected one of "InMsgBody_create_vault", "InMsgBody_create_volatile_pool", "InMsgBody_swap" in loading "InMsgBody", but data does not satisfy any constructor');
}

export function storeInMsgBody(inMsgBody: InMsgBody): (builder: Builder) => void {
    if ((inMsgBody.kind == 'InMsgBody_create_vault')) {
        return ((builder: Builder) => {
            builder.storeUint(0x21cfe02b, 32);
            builder.storeUint(inMsgBody.query_id, 64);
            storeAsset(inMsgBody.asset)(builder);
        })

    }
    if ((inMsgBody.kind == 'InMsgBody_create_volatile_pool')) {
        return ((builder: Builder) => {
            builder.storeUint(0x97d51f2f, 32);
            builder.storeUint(inMsgBody.query_id, 64);
            storeAsset(inMsgBody.asset0)(builder);
            storeAsset(inMsgBody.asset1)(builder);
        })

    }
    if ((inMsgBody.kind == 'InMsgBody_swap')) {
        return ((builder: Builder) => {
            builder.storeUint(0xea06185d, 32);
            builder.storeUint(inMsgBody.query_id, 64);
            storeCoins(inMsgBody.amount)(builder);
            storeSwapStep(inMsgBody._)(builder);
            let cell1 = beginCell();
            storeSwapParams(inMsgBody.swap_params)(cell1);
            builder.storeRef(cell1);
        })

    }
    throw new Error('Expected one of "InMsgBody_create_vault", "InMsgBody_create_volatile_pool", "InMsgBody_swap" in loading "InMsgBody", but data does not satisfy any constructor');
}

// native$0000 = Asset;

// jetton$0001 workchain_id:int8 address:uint256 = Asset;

// extra_currency$0010 currency_id:int32 = Asset;

export function loadAsset(slice: Slice): Asset {
    if (((slice.remainingBits >= 4) && (slice.preloadUint(4) == 0b0000))) {
        slice.loadUint(4);
        return {
            kind: 'Asset_native',
        }

    }
    if (((slice.remainingBits >= 4) && (slice.preloadUint(4) == 0b0001))) {
        slice.loadUint(4);
        let workchain_id: number = slice.loadInt(8);
        let address: bigint = slice.loadUintBig(256);
        return {
            kind: 'Asset_jetton',
            workchain_id: workchain_id,
            address: address,
        }

    }
    if (((slice.remainingBits >= 4) && (slice.preloadUint(4) == 0b0010))) {
        slice.loadUint(4);
        let currency_id: number = slice.loadInt(32);
        return {
            kind: 'Asset_extra_currency',
            currency_id: currency_id,
        }

    }
    throw new Error('Expected one of "Asset_native", "Asset_jetton", "Asset_extra_currency" in loading "Asset", but data does not satisfy any constructor');
}

export function storeAsset(asset: Asset): (builder: Builder) => void {
    if ((asset.kind == 'Asset_native')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0000, 4);
        })

    }
    if ((asset.kind == 'Asset_jetton')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0001, 4);
            builder.storeInt(asset.workchain_id, 8);
            builder.storeUint(asset.address, 256);
        })

    }
    if ((asset.kind == 'Asset_extra_currency')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0010, 4);
            builder.storeInt(asset.currency_id, 32);
        })

    }
    throw new Error('Expected one of "Asset_native", "Asset_jetton", "Asset_extra_currency" in loading "Asset", but data does not satisfy any constructor');
}

// timestamp#_ _:uint32 = Timestamp;

export function loadTimestamp(slice: Slice): Timestamp {
    let _: number = slice.loadUint(32);
    return {
        kind: 'Timestamp',
        _: _,
    }

}

export function storeTimestamp(timestamp: Timestamp): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(timestamp._, 32);
    })

}

// given_in$0 = SwapKind;

// given_out$1 = SwapKind;

export function loadSwapKind(slice: Slice): SwapKind {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        return {
            kind: 'SwapKind_given_in',
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        return {
            kind: 'SwapKind_given_out',
        }

    }
    throw new Error('Expected one of "SwapKind_given_in", "SwapKind_given_out" in loading "SwapKind", but data does not satisfy any constructor');
}

export function storeSwapKind(swapKind: SwapKind): (builder: Builder) => void {
    if ((swapKind.kind == 'SwapKind_given_in')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((swapKind.kind == 'SwapKind_given_out')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
        })

    }
    throw new Error('Expected one of "SwapKind_given_in", "SwapKind_given_out" in loading "SwapKind", but data does not satisfy any constructor');
}

/*
swap_params#_ deadline:Timestamp recipient_addr:MsgAddressInt referral_addr:MsgAddress
              fulfill_payload:(Maybe ^Cell) reject_payload:(Maybe ^Cell) = SwapParams;
*/

export function loadSwapParams(slice: Slice): SwapParams {
    let deadline: Timestamp = loadTimestamp(slice);
    let recipient_addr: Address = slice.loadAddress();
    let referral_addr: Address | ExternalAddress | null = slice.loadAddressAny();
    let fulfill_payload: Maybe<Cell> = loadMaybe<Cell>(slice, ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse(true);
        return slice1.asCell()

    }));
    let reject_payload: Maybe<Cell> = loadMaybe<Cell>(slice, ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse(true);
        return slice1.asCell()

    }));
    return {
        kind: 'SwapParams',
        deadline: deadline,
        recipient_addr: recipient_addr,
        referral_addr: referral_addr,
        fulfill_payload: fulfill_payload,
        reject_payload: reject_payload,
    }

}

export function storeSwapParams(swapParams: SwapParams): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeTimestamp(swapParams.deadline)(builder);
        builder.storeAddress(swapParams.recipient_addr);
        builder.storeAddress(swapParams.referral_addr);
        storeMaybe<Cell>(swapParams.fulfill_payload, ((arg: Cell) => {
            return ((builder: Builder) => {
                let cell1 = beginCell();
                cell1.storeSlice(arg.beginParse(true));
                builder.storeRef(cell1);

            })

        }))(builder);
        storeMaybe<Cell>(swapParams.reject_payload, ((arg: Cell) => {
            return ((builder: Builder) => {
                let cell1 = beginCell();
                cell1.storeSlice(arg.beginParse(true));
                builder.storeRef(cell1);

            })

        }))(builder);
    })

}

// step#_ pool_addr:MsgAddressInt params:SwapStepParams = SwapStep;

export function loadSwapStep(slice: Slice): SwapStep {
    let pool_addr: Address = slice.loadAddress();
    let params: SwapStepParams = loadSwapStepParams(slice);
    return {
        kind: 'SwapStep',
        pool_addr: pool_addr,
        params: params,
    }

}

export function storeSwapStep(swapStep: SwapStep): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeAddress(swapStep.pool_addr);
        storeSwapStepParams(swapStep.params)(builder);
    })

}

// step_params#_ kind:SwapKind limit:Coins next:(Maybe ^SwapStep) = SwapStepParams;

export function loadSwapStepParams(slice: Slice): SwapStepParams {
    let kind: SwapKind = loadSwapKind(slice);
    let limit: Coins = loadCoins(slice);
    let next: Maybe<SwapStep> = loadMaybe<SwapStep>(slice, ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse(true);
        return loadSwapStep(slice1)

    }));
    return {
        kind: 'SwapStepParams',
        kind: kind,
        limit: limit,
        next: next,
    }

}

export function storeSwapStepParams(swapStepParams: SwapStepParams): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeSwapKind(swapStepParams.kind)(builder);
        storeCoins(swapStepParams.limit)(builder);
        storeMaybe<SwapStep>(swapStepParams.next, ((arg: SwapStep) => {
            return ((builder: Builder) => {
                let cell1 = beginCell();
                storeSwapStep(arg)(cell1);
                builder.storeRef(cell1);

            })

        }))(builder);
    })

}

// volatile$0 = PoolType;

// stable$1 = PoolType;

export function loadPoolType(slice: Slice): PoolType {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        return {
            kind: 'PoolType_volatile',
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        return {
            kind: 'PoolType_stable',
        }

    }
    throw new Error('Expected one of "PoolType_volatile", "PoolType_stable" in loading "PoolType", but data does not satisfy any constructor');
}

export function storePoolType(poolType: PoolType): (builder: Builder) => void {
    if ((poolType.kind == 'PoolType_volatile')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((poolType.kind == 'PoolType_stable')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
        })

    }
    throw new Error('Expected one of "PoolType_volatile", "PoolType_stable" in loading "PoolType", but data does not satisfy any constructor');
}

// pool_params#_ pool_type:PoolType asset0:Asset asset1:Asset = PoolParams;

export function loadPoolParams(slice: Slice): PoolParams {
    let pool_type: PoolType = loadPoolType(slice);
    let asset0: Asset = loadAsset(slice);
    let asset1: Asset = loadAsset(slice);
    return {
        kind: 'PoolParams',
        pool_type: pool_type,
        asset0: asset0,
        asset1: asset1,
    }

}

export function storePoolParams(poolParams: PoolParams): (builder: Builder) => void {
    return ((builder: Builder) => {
        storePoolType(poolParams.pool_type)(builder);
        storeAsset(poolParams.asset0)(builder);
        storeAsset(poolParams.asset1)(builder);
    })

}

// swap#e3a0d482 _:SwapStep swap_params:^SwapParams = ForwardPayload;

export function loadForwardPayload(slice: Slice): ForwardPayload {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0xe3a0d482))) {
        slice.loadUint(32);
        let _: SwapStep = loadSwapStep(slice);
        let slice1 = slice.loadRef().beginParse(true);
        let swap_params: SwapParams = loadSwapParams(slice1);
        return {
            kind: 'ForwardPayload',
            _: _,
            swap_params: swap_params,
        }

    }
    throw new Error('Expected one of "ForwardPayload" in loading "ForwardPayload", but data does not satisfy any constructor');
}

export function storeForwardPayload(forwardPayload: ForwardPayload): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0xe3a0d482, 32);
        storeSwapStep(forwardPayload._)(builder);
        let cell1 = beginCell();
        storeSwapParams(forwardPayload.swap_params)(cell1);
        builder.storeRef(cell1);
    })

}

/*
swap#9c610de3 asset_in:Asset asset_out:Asset amount_in:Coins amount_out:Coins
              ^[ sender_addr:MsgAddressInt referral_addr:MsgAddress
              reserve0:Coins reserve1:Coins ] = ExtOutMsgBody;
*/

export function loadExtOutMsgBody(slice: Slice): ExtOutMsgBody {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x9c610de3))) {
        slice.loadUint(32);
        let asset_in: Asset = loadAsset(slice);
        let asset_out: Asset = loadAsset(slice);
        let amount_in: Coins = loadCoins(slice);
        let amount_out: Coins = loadCoins(slice);
        let slice1 = slice.loadRef().beginParse(true);
        let sender_addr: Address = slice1.loadAddress();
        let referral_addr: Address | ExternalAddress | null = slice1.loadAddressAny();
        let reserve0: Coins = loadCoins(slice1);
        let reserve1: Coins = loadCoins(slice1);
        return {
            kind: 'ExtOutMsgBody',
            asset_in: asset_in,
            asset_out: asset_out,
            amount_in: amount_in,
            amount_out: amount_out,
            sender_addr: sender_addr,
            referral_addr: referral_addr,
            reserve0: reserve0,
            reserve1: reserve1,
        }

    }
    throw new Error('Expected one of "ExtOutMsgBody" in loading "ExtOutMsgBody", but data does not satisfy any constructor');
}

export function storeExtOutMsgBody(extOutMsgBody: ExtOutMsgBody): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0x9c610de3, 32);
        storeAsset(extOutMsgBody.asset_in)(builder);
        storeAsset(extOutMsgBody.asset_out)(builder);
        storeCoins(extOutMsgBody.amount_in)(builder);
        storeCoins(extOutMsgBody.amount_out)(builder);
        let cell1 = beginCell();
        cell1.storeAddress(extOutMsgBody.sender_addr);
        cell1.storeAddress(extOutMsgBody.referral_addr);
        storeCoins(extOutMsgBody.reserve0)(cell1);
        storeCoins(extOutMsgBody.reserve1)(cell1);
        builder.storeRef(cell1);
    })

}

