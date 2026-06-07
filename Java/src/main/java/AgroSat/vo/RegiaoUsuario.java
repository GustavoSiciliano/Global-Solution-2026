package AgroSat.vo;

public class RegiaoUsuario {

    private Long idRegiaoUsuario;
    private Long idRegiao;
    private Long idUsuario;
    private String dtVinculo;
    private String nmRegiao;
    private String nmUsuario;

    public Long getIdRegiaoUsuario() {
        return idRegiaoUsuario;
    }

    public void setIdRegiaoUsuario(Long idRegiaoUsuario) {
        this.idRegiaoUsuario = idRegiaoUsuario;
    }

    public Long getIdRegiao() {
        return idRegiao;
    }

    public void setIdRegiao(Long idRegiao) {
        this.idRegiao = idRegiao;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getDtVinculo() {
        return dtVinculo;
    }

    public void setDtVinculo(String dtVinculo) {
        this.dtVinculo = dtVinculo;
    }

    public String getNmRegiao() {
        return nmRegiao;
    }

    public void setNmRegiao(String nmRegiao) {
        this.nmRegiao = nmRegiao;
    }

    public String getNmUsuario() {
        return nmUsuario;
    }

    public void setNmUsuario(String nmUsuario) {
        this.nmUsuario = nmUsuario;
    }

}