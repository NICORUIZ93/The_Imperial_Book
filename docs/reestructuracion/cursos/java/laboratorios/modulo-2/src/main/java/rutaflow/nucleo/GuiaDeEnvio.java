// M2 · laboratorio · rutaflow-nucleo: una guía de envío ya validada, construida a partir de una línea de texto.
// Es la misma validación que el ejemplo suelto de tema-6/LectorDeGuias.java, ahora en una clase que se puede probar.
// Aquí el rechazo no es una excepción: `motivoDeRechazo` devuelve el motivo, o `null` si la línea sirve.
package rutaflow.nucleo;

/**
 * Una guía de envío: código de 9 code points, destino y peso en gramos.
 * Al ser un `record`, dos guías leídas de líneas distintas son iguales si lo son los tres campos
 * (comparación por contenido, que es lo que el tema 1 enseña a no esperar de `==`).
 */
public record GuiaDeEnvio(String guia, String destino, int pesoGramos) {

    static final int LARGO_GUIA = 9;
    static final int CAMPOS = 3;

    /**
     * `null` si la línea se puede convertir; si no, el motivo escrito tal como lo imprime el lector.
     * Es el mismo contrato que `buscarMal` del tema 1: la ausencia de problema se representa con `null`,
     * y por eso quien llama compara con `!= null` en vez de interceptar nada.
     */
    public static String motivoDeRechazo(String linea) {
        String limpia = linea.strip();
        if (limpia.isEmpty()) {
            return "vacía, se ignora";
        }
        String[] campos = limpia.split(";");
        if (campos.length != CAMPOS) {
            return "«" + limpia + "» trae " + campos.length + " campos, se esperan " + CAMPOS;
        }
        String guia = campos[0].strip();
        int largo = guia.codePointCount(0, guia.length());
        if (largo != LARGO_GUIA) {
            return "guía «" + guia + "» tiene " + largo + " caracteres, se esperan " + LARGO_GUIA;
        }
        String pesoTexto = campos[2].strip();
        if (!sonDigitos(pesoTexto)) {
            return "peso «" + pesoTexto + "» no son solo dígitos";
        }
        return null;
    }

    /** Convierte una línea ya validada: `motivoDeRechazo` tiene que haber devuelto `null`. */
    public static GuiaDeEnvio desdeLinea(String linea) {
        String[] campos = linea.strip().split(";");
        return new GuiaDeEnvio(campos[0].strip(), campos[1].strip(), Integer.parseInt(campos[2].strip()));
    }

    /** true si todos los code points son dígitos y hay al menos uno. */
    static boolean sonDigitos(String texto) {
        if (texto.isEmpty()) {
            return false;
        }
        int p = 0;
        while (p < texto.length()) {
            int cp = texto.codePointAt(p);
            if (!Character.isDigit(cp)) {
                return false;
            }
            p += Character.charCount(cp);
        }
        return true;
    }

    /** La columna ya alineada: `%-10s` para el código, `%-12s` para el destino y `%5d` para el peso. */
    public String enLinea() {
        return String.format("%-10s %-12s %5d g", guia, destino, pesoGramos);
    }
}
