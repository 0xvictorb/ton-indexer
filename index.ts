import { tonLiteClient } from "./ton-client";
import { Address, Cell, type Transaction, loadTransaction } from "@ton/core";
import watchAddresses from "./config/watchAddresses";
import { loadInternalMsgBody, type InternalMsgBody } from "./abi/stonfi";
import { loadExtOutMsgBody, type ExtOutMsgBody } from "./abi/dedust";
import type { BlockID } from "ton-lite-client";
import _ from 'lodash-es';

function padString(input: string) {
    return input.padStart(64, '0');
}

async function processStonfi(block: BlockID) {
    const accountState = await tonLiteClient.getAccountState(Address.parse(watchAddresses.stonfi.address), block);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(padString(accountState.lastTx!.hash.toString(16)), 'hex');

    const transactionsRaw = await tonLiteClient.getAccountTransactions(
        Address.parse(watchAddresses.stonfi.address),
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

        let payload: InternalMsgBody;
        try {
            payload = loadInternalMsgBody(slice);
        } catch (error) {
            console.log('not a swap event', trx.hash().toString('hex'));
        console.log('----------------------------------------');
            continue;
        }

        console.log('SWAP EVENT:', trx.hash().toString('hex'));
        console.log('Payload:', payload);
        console.log('----------------------------------------');
      }
    }
}

async function processDedustTON_USDT(block: BlockID) {
    const accountState = await tonLiteClient.getAccountState(Address.parse(watchAddresses.dedustTON_USDT.address), block);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(padString(accountState.lastTx!.hash.toString(16)), 'hex');

    const transactionsRaw = await tonLiteClient.getAccountTransactions(
        Address.parse(watchAddresses.dedustTON_USDT.address),
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
            console.log('not a swap event', trx.hash().toString('hex'));
            console.log('----------------------------------------');
            continue;
        }

        console.log('SWAP EVENT:', trx.hash().toString('hex'));
        console.log('Payload:', payload);
        console.log('----------------------------------------');
      }
    }
}

async function main() {
  console.log('Watch addresses loaded:', watchAddresses);

  const { last } = await tonLiteClient.getMasterchainInfo();

  const blockNumber = last.seqno;
  console.log('Block number:', blockNumber);

  await Promise.all([
    processStonfi(last),
    processDedustTON_USDT(last),
  ]);
}

main().catch(console.error);
