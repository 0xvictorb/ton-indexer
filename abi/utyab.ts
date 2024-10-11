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

// _ type:uint8 hasAddress:Bool address:hasAddress?(uint256) = Asset;

export interface Asset {
    readonly kind: 'Asset';
    readonly type: number;
    readonly hasAddress: boolean;
    readonly address: bigint | undefined;
}

// _ reserve_in:Grams reserve_out:Grams = Reserves;

export interface Reserves {
    readonly kind: 'Reserves';
    readonly reserve_in: bigint;
    readonly reserve_out: bigint;
}

// swap_event#01b1b11e asset_in:Asset asset_out:Asset amount_in:Grams amount_out:Grams min_out:Grams reserves:(^Reserves)= SwapEvent;

export interface SwapEvent {
    readonly kind: 'SwapEvent';
    readonly asset_in: Asset;
    readonly asset_out: Asset;
    readonly amount_in: bigint;
    readonly amount_out: bigint;
    readonly min_out: bigint;
    readonly reserves: Reserves;
}

// _ type:uint8 hasAddress:Bool address:hasAddress?(uint256) = Asset;

export function loadAsset(slice: Slice): Asset {
    let type: number = slice.loadUint(8);
    let hasAddress: boolean = slice.loadBoolean();
    let address: bigint | undefined = (hasAddress ? slice.loadUintBig(256) : undefined);
    return {
        kind: 'Asset',
        type: type,
        hasAddress: hasAddress,
        address: address,
    }

}

export function storeAsset(asset: Asset): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(asset.type, 8);
        builder.storeBit(asset.hasAddress);
        if ((asset.address != undefined)) {
            builder.storeUint(asset.address, 256);
        }
    })

}

// _ reserve_in:Grams reserve_out:Grams = Reserves;

export function loadReserves(slice: Slice): Reserves {
    let reserve_in: bigint = slice.loadCoins();
    let reserve_out: bigint = slice.loadCoins();
    return {
        kind: 'Reserves',
        reserve_in: reserve_in,
        reserve_out: reserve_out,
    }

}

export function storeReserves(reserves: Reserves): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeCoins(reserves.reserve_in);
        builder.storeCoins(reserves.reserve_out);
    })

}

// swap_event#01b1b11e asset_in:Asset asset_out:Asset amount_in:Grams amount_out:Grams min_out:Grams reserves:(^Reserves)= SwapEvent;

export function loadSwapEvent(slice: Slice): SwapEvent {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x01b1b11e))) {
        slice.loadUint(32);
        let asset_in: Asset = loadAsset(slice);
        let asset_out: Asset = loadAsset(slice);
        let amount_in: bigint = slice.loadCoins();
        let amount_out: bigint = slice.loadCoins();
        let min_out: bigint = slice.loadCoins();
        let slice1 = slice.loadRef().beginParse(true);
        let reserves: Reserves = loadReserves(slice1);
        return {
            kind: 'SwapEvent',
            asset_in: asset_in,
            asset_out: asset_out,
            amount_in: amount_in,
            amount_out: amount_out,
            min_out: min_out,
            reserves: reserves,
        }

    }
    throw new Error('Expected one of "SwapEvent" in loading "SwapEvent", but data does not satisfy any constructor');
}

export function storeSwapEvent(swapEvent: SwapEvent): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0x01b1b11e, 32);
        storeAsset(swapEvent.asset_in)(builder);
        storeAsset(swapEvent.asset_out)(builder);
        builder.storeCoins(swapEvent.amount_in);
        builder.storeCoins(swapEvent.amount_out);
        builder.storeCoins(swapEvent.min_out);
        let cell1 = beginCell();
        storeReserves(swapEvent.reserves)(cell1);
        builder.storeRef(cell1);
    })

}

