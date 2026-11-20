package academia.cache;

import java.io.Serializable;

/**
 * Serializable porque el RedisCacheManager por defecto guarda los valores con serialización Java.
 * Sin "implements Serializable" el primer put falla con SerializationException (ver la ficha, punto 12).
 */
public record Producto(long id, String nombre, int precio) implements Serializable {
}
