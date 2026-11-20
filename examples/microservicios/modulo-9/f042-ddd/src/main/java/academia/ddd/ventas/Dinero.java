package academia.ddd.ventas;

/** Objeto de valor: se compara por su valor, es inmutable y se valida al nacer. Pesos colombianos sin decimales. */
public record Dinero(long pesos) {

    public Dinero {
        if (pesos < 0) {
            throw new IllegalArgumentException("el dinero no puede ser negativo: " + pesos);
        }
    }

    public static final Dinero CERO = new Dinero(0);

    public Dinero mas(Dinero otro) {
        return new Dinero(Math.addExact(pesos, otro.pesos));
    }

    public Dinero por(int cantidad) {
        return new Dinero(Math.multiplyExact(pesos, cantidad));
    }
}
