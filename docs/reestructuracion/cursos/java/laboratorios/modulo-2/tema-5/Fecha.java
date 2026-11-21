// tema-5/Fecha.java — las conversiones de tiempo «t» y «T»: qué tipos de datos aceptan de verdad.
// Ejecutar: javac --release 25 -d out tema-5/Fecha.java && java -Dstdout.encoding=UTF-8 -cp out Fecha
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Locale;

public class Fecha {

    static final Locale ES = Locale.forLanguageTag("es-CO");

    public static void main(String[] args) {
        LocalDate fecha = LocalDate.of(2026, 11, 20);
        LocalDateTime instante = LocalDateTime.of(2026, 11, 20, 17, 45, 12);
        Date antigua = Date.from(instante.atZone(ZoneId.systemDefault()).toInstant());

        System.out.println("--- con java.util.Date (el tipo que Formatter siempre aceptó) ---");
        System.out.println("%1$td/%1$tm/%1$tY : " + String.format(ES, "%1$td/%1$tm/%1$tY", antigua));
        System.out.println("%1$tH:%1$tM:%1$tS : " + String.format(ES, "%1$tH:%1$tM:%1$tS", antigua));
        System.out.println("%1$tA %1$te      : " + String.format(ES, "%1$tA %1$te", antigua));
        System.out.println("%1$TB            : " + String.format(ES, "%1$TB", antigua));
        System.out.println("%tF              : " + String.format(ES, "%tF", antigua));
        System.out.println("%1$tR            : " + String.format(ES, "%1$tR", antigua));

        System.out.println("--- con LocalDate / LocalDateTime (java.time) ---");
        try {
            System.out.println("%tF con LocalDate  : " + String.format(ES, "%tF", fecha));
        } catch (RuntimeException e) {
            System.out.println("%tF con LocalDate  : " + e.getClass().getName() + " — " + e.getMessage());
        }
        try {
            System.out.println("%s  con LocalDate  : " + String.format("%s", fecha));
            System.out.println("%s  con LocalDateTime: " + String.format("%s", instante));
        } catch (RuntimeException e) {
            System.out.println("%s  : " + e.getClass().getName());
        }

        System.out.println("--- lo que sí funciona con java.time: formateadores de la propia clase ---");
        System.out.println("ISO                   : " + fecha);
        System.out.println("DateTimeFormatter ES  : " + instante.format(
                java.time.format.DateTimeFormatter.ofPattern("EEEE d 'de' MMMM yyyy, HH:mm", ES)));
        System.out.println("mismo instante en inglés: " + instante.format(
                java.time.format.DateTimeFormatter.ofPattern("EEEE d 'de' MMMM yyyy, HH:mm", Locale.ENGLISH)));
    }
}
