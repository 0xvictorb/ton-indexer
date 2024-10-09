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

// _ type:uint8 address:uint256 = Asset;

export interface Asset {
    readonly kind: 'Asset';
    readonly type: number;
    readonly address: bigint;
}

// swap#0daa5c46 amount:Grams asset_in:Asset receiver:MsgAddressInt referral:MsgAddressInt = InMsgBody;

export interface InMsgBody {
    readonly kind: 'InMsgBody';
    readonly amount: bigint;
    readonly asset_in: Asset;
    readonly receiver: Address;
    readonly referral: Address;
}

// _ type:uint8 address:uint256 = Asset;

export function loadAsset(slice: Slice): Asset {
    let type: number = slice.loadUint(8);
    let address: bigint = slice.loadUintBig(256);
    return {
        kind: 'Asset',
        type: type,
        address: address,
    }

}

export function storeAsset(asset: Asset): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(asset.type, 8);
        builder.storeUint(asset.address, 256);
    })

}

// swap#0daa5c46 amount:Grams asset_in:Asset receiver:MsgAddressInt referral:MsgAddressInt = InMsgBody;

export function loadInMsgBody(slice: Slice): InMsgBody {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x0daa5c46))) {
        slice.loadUint(32);
        let amount: bigint = slice.loadCoins();
        let asset_in: Asset = loadAsset(slice);
        let receiver: Address = slice.loadAddress();
        let referral: Address = slice.loadAddress();
        return {
            kind: 'InMsgBody',
            amount: amount,
            asset_in: asset_in,
            receiver: receiver,
            referral: referral,
        }

    }
    throw new Error('Expected one of "InMsgBody" in loading "InMsgBody", but data does not satisfy any constructor');
}

export function storeInMsgBody(inMsgBody: InMsgBody): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0x0daa5c46, 32);
        builder.storeCoins(inMsgBody.amount);
        storeAsset(inMsgBody.asset_in)(builder);
        builder.storeAddress(inMsgBody.receiver);
        builder.storeAddress(inMsgBody.referral);
    })

}
