package academia.estilos;

/**
 * Lo que sabes de tu organización y de tu producto antes de elegir un estilo de arquitectura.
 *
 * @param nombre                        nombre del caso
 * @param desarrolladores               personas que escriben código en el producto
 * @param equipos                       equipos que necesitan avanzar sin coordinarse cada día
 * @param partesEscalanDistinto         ¿una parte recibe 10 veces más carga que el resto?
 * @param despliegueIndependiente       ¿cada equipo necesita desplegar sin esperar a los demás?
 * @param dominioEntendido              ¿ya sabes dónde están las fronteras del negocio?
 * @param integraAplicacionesDeVariasAreas ¿el reto es conectar aplicaciones existentes (ERP, CRM...)?
 * @param plataformaOperativa           ¿hay CI/CD, contenedores, monitoreo y guardias 24/7?
 */
public record Contexto(String nombre, int desarrolladores, int equipos, boolean partesEscalanDistinto,
        boolean despliegueIndependiente, boolean dominioEntendido,
        boolean integraAplicacionesDeVariasAreas, boolean plataformaOperativa) {
}
