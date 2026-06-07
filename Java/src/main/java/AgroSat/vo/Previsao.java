package AgroSat.vo;

public class Previsao {

    private Long idPrevisao;
    private Long idLeitura;
    private String dsStatusVegetacao;
    private Double nrRiscoHidrico;
    private String dsModeloUsado;
    private String dtPrevisao;
    private String nmRegiao;
    private Double nrNdvi;
    private Double nrTemperatura;

    public Long getIdPrevisao() {
        return idPrevisao;
    }

    public void setIdPrevisao(Long idPrevisao) {
        this.idPrevisao = idPrevisao;
    }

    public Long getIdLeitura() {
        return idLeitura;
    }

    public void setIdLeitura(Long idLeitura) {
        this.idLeitura = idLeitura;
    }

    public String getDsStatusVegetacao() {
        return dsStatusVegetacao;
    }

    public void setDsStatusVegetacao(String dsStatusVegetacao) {
        this.dsStatusVegetacao = dsStatusVegetacao;
    }

    public Double getNrRiscoHidrico() {
        return nrRiscoHidrico;
    }

    public void setNrRiscoHidrico(Double nrRiscoHidrico) {
        this.nrRiscoHidrico = nrRiscoHidrico;
    }

    public String getDsModeloUsado() {
        return dsModeloUsado;
    }

    public void setDsModeloUsado(String dsModeloUsado) {
        this.dsModeloUsado = dsModeloUsado;
    }

    public String getDtPrevisao() {
        return dtPrevisao;
    }

    public void setDtPrevisao(String dtPrevisao) {
        this.dtPrevisao = dtPrevisao;
    }

    public String getNmRegiao() {
        return nmRegiao;
    }

    public void setNmRegiao(String nmRegiao) {
        this.nmRegiao = nmRegiao;
    }

    public Double getNrNdvi() {
        return nrNdvi;
    }

    public void setNrNdvi(Double nrNdvi) {
        this.nrNdvi = nrNdvi;
    }

    public Double getNrTemperatura() {
        return nrTemperatura;
    }

    public void setNrTemperatura(Double nrTemperatura) {
        this.nrTemperatura = nrTemperatura;
    }

}