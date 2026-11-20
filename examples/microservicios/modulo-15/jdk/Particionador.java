import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * F075 · Simulador SIN Kafka (solo JDK 25): reproduce las dos decisiones que toma Kafka por ti.
 *
 * 1) A qué partición va un mensaje con clave: Utils.toPositive(Utils.murmur2(clave)) % particiones
 *    (BuiltInPartitioner.partitionForKey de kafka-clients 4.2.2; murmur2 copiado de
 *    clients/src/main/java/org/apache/kafka/common/utils/Utils.java, Apache License 2.0).
 * 2) Qué particiones recibe cada consumidor de un grupo con RangeAssignor (el primero de la lista
 *    por defecto de partition.assignment.strategy en el protocolo «classic»).
 *
 * Ejecuta:  java Particionador.java        (termina con código 1 si alguna comprobación falla)
 */
public class Particionador {

    /** murmur2 de Kafka: semilla 0x9747b28c, bloques de 4 bytes en little-endian. */
    static int murmur2(byte[] data) {
        int length = data.length;
        int seed = 0x9747b28c;
        final int m = 0x5bd1e995;
        final int r = 24;
        int h = seed ^ length;
        int length4 = length >> 2;
        for (int i = 0; i < length4; i++) {
            int i4 = i << 2;
            int k = (data[i4] & 0xff) + ((data[i4 + 1] & 0xff) << 8)
                    + ((data[i4 + 2] & 0xff) << 16) + ((data[i4 + 3] & 0xff) << 24);
            k *= m;
            k ^= k >>> r;
            k *= m;
            h *= m;
            h ^= k;
        }
        int index = length4 << 2;
        switch (length - index) {
            case 3:
                h ^= (data[index + 2] & 0xff) << 16;
            case 2:
                h ^= (data[index + 1] & 0xff) << 8;
            case 1:
                h ^= data[index] & 0xff;
                h *= m;
        }
        h ^= h >>> 13;
        h *= m;
        h ^= h >>> 15;
        return h;
    }

    static int particion(String clave, int particiones) {
        int hash = murmur2(clave.getBytes(StandardCharsets.UTF_8));
        return (hash & 0x7fffffff) % particiones;                 // Utils.toPositive(...) % n
    }

    /** RangeAssignor para UN topic: particiones en orden, consumidores en orden; los primeros reciben una extra. */
    static Map<String, List<Integer>> range(int particiones, List<String> consumidores) {
        Map<String, List<Integer>> asignacion = new TreeMap<>();
        List<String> ordenados = new ArrayList<>(consumidores);
        ordenados.sort(null);
        int porConsumidor = particiones / ordenados.size();
        int conExtra = particiones % ordenados.size();
        int siguiente = 0;
        for (int i = 0; i < ordenados.size(); i++) {
            int cuantas = porConsumidor + (i < conExtra ? 1 : 0);
            List<Integer> suyas = new ArrayList<>();
            for (int j = 0; j < cuantas; j++) {
                suyas.add(siguiente++);
            }
            asignacion.put(ordenados.get(i), suyas);
        }
        return asignacion;
    }

    public static void main(String[] args) {
        int fallos = 0;
        // Vectores de prueba de UtilsTest.testMurmur2 en apache/kafka 4.2.2: si coinciden, el hash es el de Kafka.
        Object[][] vectores = {{"21", -973932308}, {"foobar", -790332482}, {"abc", 479470107},
                {"a-little-bit-long-string", -985981536}};
        for (Object[] v : vectores) {
            int obtenido = murmur2(((String) v[0]).getBytes(StandardCharsets.UTF_8));
            boolean ok = obtenido == (int) v[1];
            fallos += ok ? 0 : 1;
            System.out.printf("murmur2(\"%s\") = %d %s%n", v[0], obtenido, ok ? "✔" : "✘ esperado " + v[1]);
        }

        System.out.println();
        System.out.println("Topic con 3 particiones · partición = toPositive(murmur2(clave)) % 3");
        Map<Integer, List<String>> porParticion = new TreeMap<>();
        for (int i = 1; i <= 6; i++) {
            String clave = "cliente-" + i;
            int p = particion(clave, 3);
            porParticion.computeIfAbsent(p, x -> new ArrayList<>()).add(clave);
            System.out.printf("  %-10s -> partición %d%n", clave, p);
        }
        if (porParticion.size() != 3) {
            System.out.println("✘ las 6 claves no cubren las 3 particiones");
            fallos++;
        }

        System.out.println();
        System.out.println("Si el topic pasa de 3 a 4 particiones, la misma clave puede cambiar de partición:");
        int cambian = 0;
        for (int i = 1; i <= 6; i++) {
            String clave = "cliente-" + i;
            int antes = particion(clave, 3);
            int despues = particion(clave, 4);
            cambian += antes != despues ? 1 : 0;
            System.out.printf("  %-10s 3 particiones -> %d · 4 particiones -> %d%s%n", clave, antes, despues,
                    antes != despues ? "   <- cambia" : "");
        }
        System.out.printf("  %d de 6 claves cambian de partición%n", cambian);

        System.out.println();
        System.out.println("RangeAssignor · topic de 3 particiones, grupo «inventario»:");
        for (int n = 1; n <= 4; n++) {
            List<String> consumidores = new ArrayList<>();
            for (int c = 0; c < n; c++) {
                consumidores.add("consumidor-" + c);
            }
            Map<String, List<Integer>> a = range(3, consumidores);
            System.out.printf("  %d consumidor(es): %s%n", n, a);
            int asignadas = a.values().stream().mapToInt(List::size).sum();
            if (asignadas != 3) {
                fallos++;
            }
        }
        System.out.println(fallos == 0 ? "\nSIMULADOR OK" : "\nSIMULADOR CON " + fallos + " FALLOS");
        System.exit(fallos == 0 ? 0 : 1);
    }
}
