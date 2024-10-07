import { LiteClient, LiteRoundRobinEngine, LiteSingleEngine } from 'ton-lite-client';

import configMainnet from './config/lite-client-configs-mainnet.json';

const getConfigLiteClient = () => {
  return configMainnet.liteservers;
};

const servers = getConfigLiteClient();

function intToIP(int: number) {
  const part1 = int & 255;
  const part2 = (int >> 8) & 255;
  const part3 = (int >> 16) & 255;
  const part4 = (int >> 24) & 255;

  return `${part4}.${part3}.${part2}.${part1}`;
}

function createTONLiteClient() {
  const engines: LiteSingleEngine[] = servers.map(
    (server) =>
      new LiteSingleEngine({
        host: `tcp://${intToIP(server.ip)}:${server.port}`,
        publicKey: Buffer.from(server.id.key, 'base64'),
      })
  );
  // for (const s of servers) {
  //   console.log(intToIP(s.ip), s.port, s.id.key);
  // }
  const res = [];
  for (const engine of engines) {
    res.push(`${engine.host.split('://')[1]}|${engine.publicKey.toString('base64')}`);
  }

  const engine = new LiteRoundRobinEngine(engines);
  return new LiteClient({ engine });
}

export const tonLiteClient = createTONLiteClient();
