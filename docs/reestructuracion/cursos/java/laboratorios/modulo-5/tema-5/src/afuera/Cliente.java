// Java · M5 · Tema 5 · los cinco tipos de importacion, juntos
// 1. single-type-import        2. type-import-on-demand        3. single-static-import
// 4. static-import-on-demand   5. single-module-import (JEP 511, definitivo en JDK 25)
package afuera;

import bodega.Envio;                                    // (1) trae UN nombre, con su paquete debajo
import java.time.LocalDate;                             // (1) explicito: gana sobre el on-demand
import java.time.*;                                     // (2) trae los nombres de java.time, el paquete sigue fuera
import java.util.*;                                     // (2) y aqui SI se puede escribir el punto: es subpaquete
import static bodega.Envio.LOTE;                        // (3) una constante: el 24 se hornea en este .class
import static bodega.Envio.vivas;                       // (3) un campo de clase: se lee por referencia
import static bodega.Envio.Sello;                       // (3) ¡un TIPO anidado se importa con static!
import static java.time.temporal.ChronoUnit.*;         // (4) todos los miembros static de ChronoUnit
import module java.sql;                                 // (5) los tipos exportados por un modulo entero

public class Cliente {

    public static void main(String[] args) {
        System.out.println("single-type          : " + Envio.class.getName());
        System.out.println("on-demand java.time  : " + LocalDate.of(2026, 11, 21).getDayOfWeek());
        System.out.println("on-demand con punto  : " + Random.class.getName());
        System.out.println("constante importada  : " + LOTE);
        System.out.println("campo de clase       : " + vivas);
        System.out.println("tipo anidado static  : " + Sello.pauta());
        System.out.println("static-on-demand     : " + DAYS + " · " + MONTHS);
        System.out.println("modulo importado     : " + Driver.class.getName());
        System.out.println("otra exportacion     : " + DataSource.class.getName());
    }
}
