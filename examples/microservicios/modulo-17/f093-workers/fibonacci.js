// F093 · Trabajo de CPU puro (recursivo a propósito para que tarde): fib(32) ≈ 30–60 ms, fib(36) ≈ 200–500 ms.
export function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
