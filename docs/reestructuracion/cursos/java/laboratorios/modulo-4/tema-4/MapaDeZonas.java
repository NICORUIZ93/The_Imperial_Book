// M4 · Tema 4 · HashMap: clave -> valor, sin orden, y get de una clave ausente NO es un error.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out MapaDeZonas
import java.util.HashMap;
import java.util.Map;

public class MapaDeZonas {
    public static void main(String[] args) {
        Map<String, Integer> topePorZona = new HashMap<>();
        topePorZona.put("Medellin", 30000);
        topePorZona.put("Bogota", 50000);
        topePorZona.put("Cali", 20000);
        System.out.println("tres puestas             : " + topePorZona + " · size " + topePorZona.size());

        // put repite clave: sustituye y DEVUELVE el valor anterior.
        Integer viejo = topePorZona.put("Cali", 25000);
        System.out.println("put repetido             : devolvio " + viejo + " · queda " + topePorZona.get("Cali"));

        // putIfAbsent y replace: dos decisiones distintas sobre la clave que ya esta.
        System.out.println("putIfAbsent(Medellin)    : " + topePorZona.putIfAbsent("Medellin", 1)
                + " · sigue " + topePorZona.get("Medellin"));
        System.out.println("putIfAbsent(Pereira)     : " + topePorZona.putIfAbsent("Pereira", 15000)
                + " · ya esta " + topePorZona.get("Pereira"));
        System.out.println("replace de ausente       : " + topePorZona.replace("Manizales", 1) + " (null = no estaba)");

        // get de clave ausente: null, silencioso. getOrDefault no lo es.
        Integer leido = topePorZona.get("Quibd");
        System.out.println("get de ausente           : " + leido + " · getOrDefault: "
                + topePorZona.getOrDefault("Quibd", 0));
        try {
            int doble = leido * 2;                   // aqui llega el NullPointerException
            System.out.println("no se imprime            : " + doble);
        } catch (NullPointerException e) {
            System.out.println("desempaquetar el null    : " + e.getClass().getSimpleName());
        }

        // merge y computeIfAbsent: acumular sin preguntar si la clave existe.
        Map<String, Integer> pesosPorZona = new HashMap<>();
        for (String zona : new String[] {"Medellin", "Bogota", "Medellin", "Cali", "Medellin"}) {
            pesosPorZona.merge(zona, 1000, Integer::sum);
        }
        System.out.println("merge acumulando         : " + pesosPorZona);
        pesosPorZona.computeIfAbsent("Pereira", z -> 500);            // no estaba: se calcula y entra
        pesosPorZona.computeIfAbsent("Medellin", z -> 999999);        // si estaba: la funcion NO se ejecuta
        System.out.println("computeIfAbsent          : " + pesosPorZona);

        // Las tres vistas: keySet, values, entrySet. Ninguna garantiza orden.
        System.out.println("claves                   : " + topePorZona.keySet());
        System.out.println("valores                  : " + topePorZona.values());
        for (Map.Entry<String, Integer> e : topePorZona.entrySet()) {
            if (e.getValue() > 25000) {
                System.out.println("entrada mayor a 25 kg     : " + e.getKey() + " -> " + e.getValue());
            }
        }

        // Preguntado en frío: ¿el mapa respeta el orden en que insertaste?
        boolean conserva = topePorZona.keySet().toString().equals("[Medellin, Bogota, Cali, Pereira]");
        System.out.println("HashMap conserva el orden de insercion? " + conserva);

        // Si hace falta el orden, la herramienta es otra: LinkedHashMap.
        Map<String, Integer> conOrden = new java.util.LinkedHashMap<>();
        conOrden.put("Medellin", 30000);
        conOrden.put("Bogota", 50000);
        conOrden.put("Cali", 20000);
        System.out.println("LinkedHashMap si lo conserva: " + conOrden.keySet());

        // Un HashMap admite UNA clave null y valores null: no es un error, es una ranura mas.
        Map<String, String> observaciones = new HashMap<>();
        observaciones.put(null, "sin zona asignada");
        observaciones.put("Cali", null);
        System.out.println("clave null               : " + observaciones.get(null) + " · valor null: "
                + observaciones.get("Cali") + " · contiene clave " + observaciones.containsKey("Cali"));
    }
}
