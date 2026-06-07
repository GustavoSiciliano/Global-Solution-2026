package AgroSat.vo;

public class Regiao {

    private Long idRegiao;
    private String nmRegiao;
    private String dsEstado;
    private Double nrLatitude;
    private Double nrLongitude;
    private String dsBioma;
    private String dtCadastro;

    public Long getIdRegiao() {
        return idRegiao;
    }

    public void setIdRegiao(Long idRegiao) {
        this.idRegiao = idRegiao;
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

    public Double getNrLatitude() {
        return nrLatitude;
    }

    public void setNrLatitude(Double nrLatitude) {
        this.nrLatitude = nrLatitude;
    }

    public Double getNrLongitude() {
        return nrLongitude;
    }

    public void setNrLongitude(Double nrLongitude) {
        this.nrLongitude = nrLongitude;
    }

    public String getDsBioma() {
        return dsBioma;
    }

    public void setDsBioma(String dsBioma) {
        this.dsBioma = dsBioma;
    }

    public String getDtCadastro() {
        return dtCadastro;
    }

    public void setDtCadastro(String dtCadastro) {
        this.dtCadastro = dtCadastro;
    }

}