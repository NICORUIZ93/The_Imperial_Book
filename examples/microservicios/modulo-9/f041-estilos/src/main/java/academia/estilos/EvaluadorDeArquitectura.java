package academia.estilos;

import java.util.ArrayList;
import java.util.List;

/**
 * Regla de decisión de F041. No es una ley universal: resume los criterios de la ficha para que puedas
 * discutirlos con un test en la mano. Empieza siempre por el monolito modular y exige evidencia para salir de él.
 */
public final class EvaluadorDeArquitectura {

    /** Por debajo de 3 equipos, la coordinación cabe en una reunión: separar despliegues no compensa. */
    static final int EQUIPOS_MINIMOS = 3;

    private EvaluadorDeArquitectura() {
    }

    public static Recomendacion evaluar(Contexto c) {
        // SOA: el problema es integrar aplicaciones existentes de varias áreas, no dividir un producto propio.
        if (c.integraAplicacionesDeVariasAreas() && !c.despliegueIndependiente()) {
            return new Recomendacion(Estilo.SOA, List.of(
                    "el reto es integrar aplicaciones existentes de varias áreas",
                    "un contrato de servicio compartido (bus o API corporativa) evita integraciones punto a punto"));
        }
        List<String> faltan = new ArrayList<>();
        if (c.equipos() < EQUIPOS_MINIMOS) {
            faltan.add("solo " + c.equipos() + " equipo(s): la coordinación cabe en una reunión");
        }
        if (!c.dominioEntendido()) {
            faltan.add("las fronteras del dominio aún no están claras: cortarías por el lugar equivocado");
        }
        if (!c.plataformaOperativa()) {
            faltan.add("no hay plataforma operativa (CI/CD, contenedores, monitoreo, guardias)");
        }
        if (!c.partesEscalanDistinto() && !c.despliegueIndependiente()) {
            faltan.add("ninguna parte necesita escalar ni desplegarse por separado");
        }
        if (faltan.isEmpty()) {
            return new Recomendacion(Estilo.MICROSERVICIOS, List.of(
                    c.equipos() + " equipos necesitan desplegar sin esperarse",
                    "el dominio tiene fronteras conocidas y hay plataforma para operar muchos servicios"));
        }
        return new Recomendacion(Estilo.MONOLITO_MODULAR, List.copyOf(faltan));
    }
}
