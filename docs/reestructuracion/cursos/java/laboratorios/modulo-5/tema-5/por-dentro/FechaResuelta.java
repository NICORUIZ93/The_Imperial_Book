// Java · M5 · Tema 5 · el single-type-import gana al on-demand
// JLS 7.5.1: un nombre importado explicitamente tiene prioridad sobre los que trae un import-on-demand.
// Aqui `Date` podria ser java.util.Date (por el on-demand) o java.sql.Date (por el import explicito):
// gana el explicito, y el programa lo imprime.
import java.util.*;
import module java.base;
import module java.sql;
import java.sql.Date;

public class FechaResuelta {

    public static void main(String[] args) {
        System.out.println("Date resuelto      : " + Date.class.getName());
        System.out.println("List por el modulo : " + ArrayList.class.getName());
    }
}
