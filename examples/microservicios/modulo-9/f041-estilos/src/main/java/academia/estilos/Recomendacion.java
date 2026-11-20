package academia.estilos;

import java.util.List;

/** Estilo elegido y las razones que lo justifican (o lo que falta para otro estilo). */
public record Recomendacion(Estilo estilo, List<String> razones) {
}
