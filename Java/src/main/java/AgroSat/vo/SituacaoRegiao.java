package AgroSat.vo;

import java.util.List;

// VO de resposta do endpoint /regioes/situacao/cep — agrega dados do banco
public class SituacaoRegiao {

    private Regiao regiao;
    private LeituraSatelital ultimaLeitura;
    private Previsao ultimaPrevisao;
    private List<Alerta> alertasPendentes;

    public Regiao getRegiao() {
        return regiao;
    }

    public void setRegiao(Regiao regiao) {
        this.regiao = regiao;
    }

    public LeituraSatelital getUltimaLeitura() {
        return ultimaLeitura;
    }

    public void setUltimaLeitura(LeituraSatelital ultimaLeitura) {
        this.ultimaLeitura = ultimaLeitura;
    }

    public Previsao getUltimaPrevisao() {
        return ultimaPrevisao;
    }

    public void setUltimaPrevisao(Previsao ultimaPrevisao) {
        this.ultimaPrevisao = ultimaPrevisao;
    }

    public List<Alerta> getAlertasPendentes() {
        return alertasPendentes;
    }

    public void setAlertasPendentes(List<Alerta> alertasPendentes) {
        this.alertasPendentes = alertasPendentes;
    }
}
