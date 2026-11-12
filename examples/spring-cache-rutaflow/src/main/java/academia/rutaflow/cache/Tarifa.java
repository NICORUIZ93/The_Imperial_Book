package academia.rutaflow.cache;

import java.io.Serializable;

public record Tarifa(String zona, int centavos) implements Serializable { }
