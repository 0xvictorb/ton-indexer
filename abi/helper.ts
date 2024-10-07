/// <reference path="../global.d.ts" />

import { Builder } from '@ton/core'
import { Slice } from '@ton/core'

export function loadEither<X, Y>(slice: Slice, loadX: (slice: Slice) => X, loadY: (slice: Slice) => Y): Either<X, Y> {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        let value: X = loadX(slice);
        return {
            kind: 'Either_left',
            value: value,
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let value: Y = loadY(slice);
        return {
            kind: 'Either_right',
            value: value,
        }

    }
    throw new Error('Expected one of "Either_left", "Either_right" in loading "Either", but data does not satisfy any constructor');
}

export function storeEither<X, Y>(either: Either<X, Y>, storeX: (x: X) => (builder: Builder) => void, storeY: (y: Y) => (builder: Builder) => void): (builder: Builder) => void {
    if ((either.kind == 'Either_left')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
            storeX(either.value)(builder);
        })

    }
    if ((either.kind == 'Either_right')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            storeY(either.value)(builder);
        })

    }
    throw new Error('Expected one of "Either_left", "Either_right" in loading "Either", but data does not satisfy any constructor');
}
