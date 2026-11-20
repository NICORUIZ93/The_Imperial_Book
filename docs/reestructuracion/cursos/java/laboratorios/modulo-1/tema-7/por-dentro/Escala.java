// M1 · Tema 7 · nivel maestro: un BigDecimal es un entero sin escala más una escala.
// Ejecuta: java -Dstdout.encoding=UTF-8 Escala.java
void main() {
    BigDecimal flete = new BigDecimal("11500.00");
    BigDecimal tasa = new BigDecimal("0.19");
    BigDecimal producto = flete.multiply(tasa);
    IO.println("flete:    sin escala " + flete.unscaledValue() + " · escala " + flete.scale() + " · precisión " + flete.precision());
    IO.println("tasa:     sin escala " + tasa.unscaledValue() + " · escala " + tasa.scale());
    IO.println("producto: " + producto + " · sin escala " + producto.unscaledValue() + " · escala " + producto.scale());

    BigDecimal a = new BigDecimal("2.0");
    BigDecimal b = new BigDecimal("2.00");
    IO.println("2.0  → sin escala " + a.unscaledValue() + " · escala " + a.scale() + " · hashCode " + a.hashCode());
    IO.println("2.00 → sin escala " + b.unscaledValue() + " · escala " + b.scale() + " · hashCode " + b.hashCode());
    IO.println("tras stripTrailingZeros, ¿equals? " + a.stripTrailingZeros().equals(b.stripTrailingZeros()));
    IO.println("flete.add(tasa) sin guardar → flete sigue valiendo " + flete);
}
