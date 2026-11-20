// M1 · Tema 6 · nivel maestro: los 64 bits de 0.1 separados en signo, exponente y mantisa.
// Ejecuta: java -Dstdout.encoding=UTF-8 Bits.java
void main() {
    long bits = Double.doubleToLongBits(0.1);
    String b = String.format("%64s", Long.toBinaryString(bits)).replace(' ', '0');
    int exponente = Integer.parseInt(b.substring(1, 12), 2);
    IO.println("signo:     " + b.substring(0, 1));
    IO.println("exponente: " + b.substring(1, 12) + " = " + exponente + " (menos 1023 = " + (exponente - 1023) + ")");
    IO.println("mantisa:   " + b.substring(12));
    IO.println("hexadecimal exacto: " + Double.toHexString(0.1));
    IO.println("double siguiente a 0.1: " + Math.nextUp(0.1));
    IO.println("menor normal: " + Double.MIN_NORMAL + " · menor subnormal: " + Double.MIN_VALUE);
}
