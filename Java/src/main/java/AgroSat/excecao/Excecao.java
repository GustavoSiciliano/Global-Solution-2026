package AgroSat.excecao;

// Excecao customizada — carrega o codigo HTTP junto da mensagem
public class Excecao extends RuntimeException {

    private final int status;

    public Excecao(String mensagem, int status) {
        super(mensagem);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
