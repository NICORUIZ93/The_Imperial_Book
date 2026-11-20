package academia.saludo.autoconfigure;

/** La "librería" que el starter ofrece. No sabe nada de Spring. */
public class Saludador {
    private final String prefijo;

    public Saludador(String prefijo) { this.prefijo = prefijo; }

    public String saludar(String nombre) { return prefijo + ", " + nombre + "!"; }
}
