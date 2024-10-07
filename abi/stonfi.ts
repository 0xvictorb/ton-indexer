/// <reference path="../global.d.ts" />

import { loadEither, storeEither } from "./helper";

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

// ref_bodycell$_ from_real_user:MsgAddress ref_address:MsgAddress = RefBodyCell;

export interface RefBodyCell {
    readonly kind: 'RefBodyCell';
    readonly from_real_user: Address | ExternalAddress | null;
    readonly ref_address: Address | ExternalAddress | null;
}

// swap#25938561 query_id:uint64 from_user:MsgAddress token_wallet:MsgAddress amount:Grams min_out:Grams ref_bodycell:(Either RefBodyCell ^RefBodyCell) = InternalMsgBody;

export interface InternalMsgBody {
    readonly kind: 'InternalMsgBody';
    readonly query_id: number;
    readonly from_user: Address | ExternalAddress | null;
    readonly token_wallet: Address | ExternalAddress | null;
    readonly amount: bigint;
    readonly min_out: bigint;
    readonly ref_bodycell: Either<RefBodyCell, RefBodyCell>;
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
            kind: 'InternalMsgBody',
            query_id: query_id,
            from_user: from_user,
            token_wallet: token_wallet,
            amount: amount,
            min_out: min_out,
            ref_bodycell: ref_bodycell,
        }

    }
    throw new Error('Expected one of "InternalMsgBody" in loading "InternalMsgBody", but data does not satisfy any constructor');
}

export function storeInternalMsgBody(internalMsgBody: InternalMsgBody): (builder: Builder) => void {
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

