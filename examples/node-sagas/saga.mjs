const simulatePaymentFailure = process.argv.includes("--fail-payment");

const state = {
  order: "NEW",
  driver: "FREE",
  payment: "NOT_STARTED",
};
const undo = [];

async function createOrder() {
  state.order = "CREATED";
  undo.push(async () => { state.order = "CANCELLED"; });
}

async function reserveDriver() {
  state.driver = "RESERVED";
  undo.push(async () => { state.driver = "FREE"; });
}

async function charge() {
  if (simulatePaymentFailure) {
    state.payment = "DECLINED";
    throw new Error("Pago rechazado");
  }
  state.payment = "PAID";
}

async function createDelivery() {
  try {
    await createOrder();
    await reserveDriver();
    await charge();
    console.log(`correcto=pedido:${state.order},conductor:${state.driver},pago:${state.payment}`);
  } catch (error) {
    for (const compensate of undo.reverse()) await compensate();
    console.log(`fallo=${error.message} | pedido:${state.order},conductor:${state.driver},pago:${state.payment}`);
  }
}

await createDelivery();
