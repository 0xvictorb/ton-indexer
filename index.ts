import { tonLiteClient } from "./ton-lite-client";
import { Address, Cell, type Transaction, loadTransaction } from "@ton/core";
import watchAddresses from "./config/watchAddresses";
import { loadInternalMsgBody, type InternalMsgBody } from "./abi/stonfi";

function padString(input: string) {
    return input.padStart(64, '0');
}

async function main() {
  console.log('Watch addresses loaded:', watchAddresses);

  const { last } = await tonLiteClient.getMasterchainInfo();

  const blockNumber = last.seqno;
  console.log('Block number:', blockNumber);

  for (const address of watchAddresses) {
    const accountState = await tonLiteClient.getAccountState(Address.parse(address.address), last);
    const ltState = accountState.lastTx!.lt.toString();
    const hashState = Buffer.from(padString(accountState.lastTx!.hash.toString(16)), 'hex');

    const transactionsRaw = await tonLiteClient.getAccountTransactions(
        Address.parse(address.address),
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

      const outMessage = trx.outMessages.values()[trx.outMessages.values().length - 1];
      if (outMessage === undefined) {
        console.log('outMessage === undefined');
        continue;
      }

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

main().catch(console.error);
