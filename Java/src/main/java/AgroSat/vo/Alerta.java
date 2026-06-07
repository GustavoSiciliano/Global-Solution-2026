package AgroSat.vo;

public class Alerta {

    private Long idAlerta;
    private Long idPrevisao;
    private Long idRegiao;
    private String dsNivel;
    private String dsMensagem;
    private String flResolvido;
    private String dtAlerta;
    private String nmRegiao;
    private String dsEstado;

    public Long getIdAlerta() {
        return idAlerta;
    }

    public void setIdAlerta(Long idAlerta) {
        this.idAlerta = idAlerta;
    }

    public Long getIdPrevisao() {
        return idPrevisao;
    }

    public void setIdPrevisao(Long idPrevisao) {
        this.idPrevisao = idPrevisao;
    }

    public Long getIdRegiao() {
        return idRegiao;
    }

    public void setIdRegiao(Long idRegiao) {
        this.idRegiao = idRegiao;
    }

    public String getDsNivel() {
        return dsNivel;
    }

    public void setDsNivel(String dsNivel) {
        this.dsNivel = dsNivel;
    }

    public String getDsMensagem() {
        return dsMensagem;
    }

    public void setDsMensagem(String dsMensagem) {
        this.dsMensagem = dsMensagem;
    }

    public String getFlResolvido() {
        return flResolvido;
    }

    public void setFlResolvido(String flResolvido) {
        this.flResolvido = flResolvido;
    }

    public String getDtAlerta() {
        return dtAlerta;
    }

    public void setDtAlerta(String dtAlerta) {
        this.dtAlerta = dtAlerta;
    }

    public String getNmRegiao() {
        return nmRegiao;
    }

    public void setNmRegiao(String nmRegiao) {
        this.nmRegiao = nmRegiao;
    }

    public String getDsEstado() {
        return dsEstado;
    }

    public void setDsEstado(String dsEstado) {
        this.dsEstado = dsEstado;
    }

}