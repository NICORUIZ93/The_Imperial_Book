public class NidoPrivate {
    private int secreto = 42;

    static class Visitor {
        int lee(NidoPrivate n) {
            return n.secreto;
        }
    }

    public static void main(String[] args) {
        System.out.println("el visitor lee el privado: " + new Visitor().lee(new NidoPrivate()));
    }
}
