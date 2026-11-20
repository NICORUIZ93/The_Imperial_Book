package academia.estilos;

import java.util.List;

/** Ejecuta el evaluador sobre tres organizaciones de ejemplo e imprime la recomendación de cada una. */
public final class CompararEstilos {

    public static void main(String[] args) {
        List<Contexto> casos = List.of(
                new Contexto("Tienda de café en línea", 4, 1, false, false, false, false, false),
                new Contexto("Billetera digital", 70, 9, true, true, true, false, true),
                new Contexto("Aseguradora con ERP, CRM y cotizador", 30, 5, false, false, true, true, true));
        for (Contexto caso : casos) {
            Recomendacion r = EvaluadorDeArquitectura.evaluar(caso);
            System.out.println(caso.nombre() + " -> " + r.estilo());
            r.razones().forEach(razon -> System.out.println("   · " + razon));
        }
    }
}
