export async function captureOrder(): Promise<string[]> {
  const order: string[] = [];
  order.push('sync-start');
  setTimeout(() => order.push('macrotask-timeout'), 0);
  setImmediate(() => order.push('macrotask-immediate'));
  Promise.resolve().then(() => order.push('microtask-promise'));
  process.nextTick(() => order.push('microtask-nextTick'));
  order.push('sync-end');
  await new Promise((r) => setTimeout(r, 20));
  return order;
}
