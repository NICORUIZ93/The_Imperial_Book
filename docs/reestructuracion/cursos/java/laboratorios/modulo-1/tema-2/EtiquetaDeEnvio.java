// M1 · Tema 2 · ejemplo realista: qué puede cambiar un método cuando recibe un primitivo o una referencia.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 EtiquetaDeEnvio.java
public class EtiquetaDeEnvio {
    // Recibe una COPIA del número: cambiarla no afecta a quien llamó.
    static void recargar(int pesoGramos) {
        pesoGramos = pesoGramos + 500;
    }

    // Recibe una COPIA de la referencia: las dos apuntan al mismo objeto, y el objeto sí cambia.
    static void marcarUrgente(StringBuilder etiqueta) {
        etiqueta.append(" [URGENTE]");
    }

    // Reasignar el parámetro solo cambia la copia local de la referencia.
    static void reemplazar(StringBuilder etiqueta) {
        etiqueta = new StringBuilder("RF-999999");
    }

    public static void main(String[] args) {
        int pesoGramos = 2500;
        StringBuilder etiqueta = new StringBuilder("RF-000123");

        recargar(pesoGramos);
        System.out.println("tras recargar:      " + pesoGramos + " g");

        marcarUrgente(etiqueta);
        System.out.println("tras marcarUrgente: " + etiqueta);

        reemplazar(etiqueta);
        System.out.println("tras reemplazar:    " + etiqueta);

        // null: una referencia que no apunta a ningún objeto.
        StringBuilder sinEtiqueta = null;
        System.out.println("sinEtiqueta = " + sinEtiqueta);
        sinEtiqueta.append("x");   // aquí falla
    }
}
