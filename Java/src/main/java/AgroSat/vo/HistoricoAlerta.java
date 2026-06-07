package AgroSat.vo;

public class HistoricoAlerta {

    private Long idHistorico;
    private Long idAlerta;
    private Long idUsuario;
    private String dsAcao;
    private String dsObservacao;
    private String dtAcao;
    private String nmUsuario;
    private String nmRegiao;

    public Long getIdHistorico() {
        return idHistorico;
    }

    public void setIdHistorico(Long idHistorico) {
        this.idHistorico = idHistorico;
    }

    public Long getIdAlerta() {
        return idAlerta;
    }

    public void setIdAlerta(Long idAlerta) {
        this.idAlerta = idAlerta;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getDsAcao() {
        return dsAcao;
    }

    public void setDsAcao(String dsAcao) {
        this.dsAcao = dsAcao;
    }

    public String getDsObservacao() {
        return dsObservacao;
    }

    public void setDsObservacao(String dsObservacao) {
        this.dsObservacao = dsObservacao;
    }

    public String getDtAcao() {
        return dtAcao;
    }

    public void setDtAcao(String dtAcao) {
        this.dtAcao = dtAcao;
    }

    public String getNmUsuario() {
        return nmUsuario;
    }

    public void setNmUsuario(String nmUsuario) {
        this.nmUsuario = nmUsuario;
    }

    public String getNmRegiao() {
        return nmRegiao;
    }

    public void setNmRegiao(String nmRegiao) {
        this.nmRegiao = nmRegiao;
    }

}