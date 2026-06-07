package AgroSat.vo;

// Resultado retornado pelo modelo de IA do Render
public class ResultadoIA {

    public boolean sucesso;
    public String statusVegetacao;
    public double riscoHidrico;
    public String nivelAlerta;
    public double confianca;

    public boolean isSucesso() {
        return sucesso;
    }

    public void setSucesso(boolean sucesso) {
        this.sucesso = sucesso;
    }

    public String getStatusVegetacao() {
        return statusVegetacao;
    }

    public void setStatusVegetacao(String statusVegetacao) {
        this.statusVegetacao = statusVegetacao;
    }

    public double getRiscoHidrico() {
        return riscoHidrico;
    }

    public void setRiscoHidrico(double riscoHidrico) {
        this.riscoHidrico = riscoHidrico;
    }

    public String getNivelAlerta() {
        return nivelAlerta;
    }

    public void setNivelAlerta(String nivelAlerta) {
        this.nivelAlerta = nivelAlerta;
    }

    public double getConfianca() {
        return confianca;
    }

    public void setConfianca(double confianca) {
        this.confianca = confianca;
    }
}
