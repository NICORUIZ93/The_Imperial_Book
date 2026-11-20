// M0 · Tema 4 · nivel maestro: un archivo compacto importa el módulo java.base sin que lo escribas.
// BigDecimal está en java.math y aquí no hay ningún import. Ejecuta: java ImportImplicito.java
void main() {
    BigDecimal tarifa = new BigDecimal("11400.00");
    IO.println("tarifa: " + tarifa);
}
