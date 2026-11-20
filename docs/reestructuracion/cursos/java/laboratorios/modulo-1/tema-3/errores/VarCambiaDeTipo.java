// No compila: var no es «tipo dinámico». El tipo quedó fijado como int en la declaración.
public class VarCambiaDeTipo {
    public static void main(String[] args) {
        var peso = 2500;
        peso = "2,5 kg";
        peso = 2500.5;
    }
}
