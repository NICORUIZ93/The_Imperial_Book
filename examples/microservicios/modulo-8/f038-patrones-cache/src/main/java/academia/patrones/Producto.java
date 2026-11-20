package academia.patrones;

import java.io.Serializable;

public record Producto(long id, String nombre, int precio) implements Serializable {
}
