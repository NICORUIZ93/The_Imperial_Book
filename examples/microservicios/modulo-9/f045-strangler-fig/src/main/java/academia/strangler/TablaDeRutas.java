package academia.strangler;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Corazón del Strangler Fig: decide, para cada ruta, si la atiende el monolito o el servicio nuevo.
 * Coincide por SEGMENTOS ("/cotizaciones" atrapa "/cotizaciones/7" pero no "/cotizaciones-pdf")
 * y gana el prefijo más largo. Todo lo que no está en la tabla sigue en el monolito.
 */
public final class TablaDeRutas {

    public static final String MONOLITO = "monolito";
    private final Map<String, String> reglas = new LinkedHashMap<>();

    /** @param reglas entradas con la forma "prefijo->destino", por ejemplo "/cotizaciones->nuevo" */
    public TablaDeRutas(List<String> reglas) {
        for (String regla : reglas) {
            String[] partes = regla.split("->", 2);
            if (partes.length != 2 || !partes[0].startsWith("/")) {
                throw new IllegalArgumentException("regla inválida: '" + regla + "' (usa /prefijo->destino)");
            }
            this.reglas.put(partes[0].strip(), partes[1].strip());
        }
    }

    public String destinoPara(String ruta) {
        String elegido = MONOLITO;
        int largo = -1;
        for (var regla : reglas.entrySet()) {
            String prefijo = regla.getKey();
            boolean coincide = ruta.equals(prefijo) || ruta.startsWith(prefijo + "/");
            if (coincide && prefijo.length() > largo) {
                elegido = regla.getValue();
                largo = prefijo.length();
            }
        }
        return elegido;
    }
}
