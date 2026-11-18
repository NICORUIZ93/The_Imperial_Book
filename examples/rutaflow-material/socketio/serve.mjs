import { startGateway } from './gateway.mjs';
const gateway = await startGateway({ port: 3100 });
console.log(gateway.url);
process.once('SIGINT', async () => { await gateway.close(); });
