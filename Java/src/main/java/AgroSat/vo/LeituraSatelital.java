package AgroSat.vo;

public class LeituraSatelital {

    private Long idLeitura;
    private Long idRegiao;
    private Long idFonte;
    private Double nrNdvi;
    private Double nrTemperatura;
    private Double nrPrecipitacao;
    private Double nrUmidade;
    private Integer nrDiasSemChuva;
    private Double nrRadiacaoSolar;
    private String dtLeitura;
    private String nmRegiao;
    private String nmFonte;

    public Long getIdLeitura() {
        return idLeitura;
    }

    public void setIdLeitura(Long idLeitura) {
        this.idLeitura = idLeitura;
    }

    public Long getIdRegiao() {
        return idRegiao;
    }

    public void setIdRegiao(Long idRegiao) {
        this.idRegiao = idRegiao;
    }

    public Long getIdFonte() {
        return idFonte;
    }

    public void setIdFonte(Long idFonte) {
        this.idFonte = idFonte;
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

    public Double getNrPrecipitacao() {
        return nrPrecipitacao;
    }

    public void setNrPrecipitacao(Double nrPrecipitacao) {
        this.nrPrecipitacao = nrPrecipitacao;
    }

    public Double getNrUmidade() {
        return nrUmidade;
    }

    public void setNrUmidade(Double nrUmidade) {
        this.nrUmidade = nrUmidade;
    }

    public Integer getNrDiasSemChuva() {
        return nrDiasSemChuva;
    }

    public void setNrDiasSemChuva(Integer nrDiasSemChuva) {
        this.nrDiasSemChuva = nrDiasSemChuva;
    }

    public Double getNrRadiacaoSolar() {
        return nrRadiacaoSolar;
    }

    public void setNrRadiacaoSolar(Double nrRadiacaoSolar) {
        this.nrRadiacaoSolar = nrRadiacaoSolar;
    }

    public String getDtLeitura() {
        return dtLeitura;
    }

    public void setDtLeitura(String dtLeitura) {
        this.dtLeitura = dtLeitura;
    }

    public String getNmRegiao() {
        return nmRegiao;
    }

    public void setNmRegiao(String nmRegiao) {
        this.nmRegiao = nmRegiao;
    }

    public String getNmFonte() {
        return nmFonte;
    }

    public void setNmFonte(String nmFonte) {
        this.nmFonte = nmFonte;
    }

}