import java.util.ArrayList;
import java.util.List;

public class PrototypeDemo {
    interface Prototype<T> { T copy(); }

    static final class PackageTemplate implements Prototype<PackageTemplate> {
        private final String service;
        private final List<String> labels;

        PackageTemplate(String service, List<String> labels) {
            this.service = service;
            this.labels = new ArrayList<>(labels);
        }

        private PackageTemplate(PackageTemplate source) {
            this(source.service, source.labels);
        }

        public PackageTemplate copy() { return new PackageTemplate(this); }
        void addLabel(String label) { labels.add(label); }
        String summary() { return service + labels; }
    }

    static final class ShallowPackage {
        private final List<String> labels;
        ShallowPackage(List<String> labels) { this.labels = labels; }
        ShallowPackage copy() { return new ShallowPackage(labels); }
        void addLabel(String label) { labels.add(label); }
    }

    public static void main(String[] args) {
        if (args.length > 0 && args[0].equals("fallo")) {
            ShallowPackage original = new ShallowPackage(new ArrayList<>(List.of("fragil")));
            ShallowPackage copy = original.copy();
            copy.addLabel("urgente");
            if (original.labels.contains("urgente")) {
                throw new IllegalStateException("copia superficial compartio etiquetas");
            }
            return;
        }

        PackageTemplate original = new PackageTemplate("EXPRESS", List.of("fragil"));
        PackageTemplate copy = original.copy();
        copy.addLabel("urgente");
        System.out.println("original=" + original.summary());
        System.out.println("copia=" + copy.summary());
        System.out.println("independiente=" + !original.summary().contains("urgente"));
    }
}
