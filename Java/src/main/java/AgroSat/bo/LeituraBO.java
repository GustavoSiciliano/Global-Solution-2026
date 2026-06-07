package AgroSat.bo;

import AgroSat.conexao.ApiNasaPower;
import AgroSat.conexao.ApiOpenMeteo;
import AgroSat.dao.AlertaDAO;
import AgroSat.dao.LeituraDAO;
import AgroSat.dao.PrevisaoDAO;
import AgroSat.dao.RegiaoDAO;
import AgroSat.excecao.Excecao;
import AgroSat.render.RenderIA;
import AgroSat.vo.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Map;

@ApplicationScoped
public class LeituraBO {

    // NDVI estimado por bioma quando a API espacial nao retorna valor
    private static final Map<String, double[]> NDVI_BIOMA = Map.of(
            "Cerrado", new double[]{0.35, 0.70},
            "Amazonia", new double[]{0.65, 0.90},
            "Mata Atlantica", new double[]{0.55, 0.80},
            "Pampa", new double[]{0.45, 0.75},
            "Caatinga", new double[]{0.15, 0.50},
            "Pantanal", new double[]{0.50, 0.80}
    );

    @Inject
    LeituraDAO leituraDAO;
    @Inject
    PrevisaoDAO previsaoDAO;
    @Inject
    AlertaDAO alertaDAO;
    @Inject
    RegiaoDAO regiaoDAO;
    @Inject
    ApiNasaPower apiNasa;
    @Inject
    ApiOpenMeteo apiMeteo;
    @Inject
    RenderIA renderIA;

    public List<LeituraSatelital> listarTodas() {
        return leituraDAO.listarTodas();
    }

    public List<LeituraSatelital> listarPorRegiao(Long idRegiao) {
        if (regiaoDAO.buscarPorId(idRegiao) == null)
            throw new Excecao("Regiao nao encontrada: " + idRegiao, 404);
        return leituraDAO.listarPorRegiao(idRegiao);
    }

    public LeituraSatelital buscarPorId(Long id) {
        LeituraSatelital l = leituraDAO.buscarPorId(id);
        if (l == null) throw new Excecao("Leitura nao encontrada: " + id, 404);
        return l;
    }

    // Coleta dados das APIs espaciais automaticamente antes de salvar
    public LeituraSatelital inserirAutomatico(Long idRegiao) {
        Regiao regiao = regiaoDAO.buscarPorId(idRegiao);
        if (regiao == null) throw new Excecao("Regiao nao encontrada: " + idRegiao, 404);

        LeituraSatelital leitura = new LeituraSatelital();
        leitura.setIdRegiao(idRegiao);

        // NASA POWER — temperatura e radiacao solar
        double[] nasa = apiNasa.buscarDadosClimaticos(regiao.getNrLatitude(), regiao.getNrLongitude());
        if (nasa != null) {
            leitura.setNrTemperatura(nasa[0]);
            leitura.setNrRadiacaoSolar(nasa[1]);
        } else {
            leitura.setNrTemperatura(28.0);
            leitura.setNrRadiacaoSolar(20.0);
        }

        // Open-Meteo — precipitacao, umidade e dias sem chuva
        double[] meteo = apiMeteo.buscarDadosPrecipitacao(regiao.getNrLatitude(), regiao.getNrLongitude());
        if (meteo != null) {
            leitura.setNrPrecipitacao(meteo[0]);
            leitura.setNrUmidade(meteo[1]);
            leitura.setNrDiasSemChuva((int) meteo[2]);
        } else {
            leitura.setNrPrecipitacao(0.0);
            leitura.setNrUmidade(50.0);
            leitura.setNrDiasSemChuva(0);
        }

        // NDVI estimado pelo bioma da regiao
        leitura.setNrNdvi(estimarNdvi(regiao.getDsBioma()));

        return salvarComIA(leitura);
    }

    // Salva leitura manual e dispara IA automaticamente
    public LeituraSatelital inserir(LeituraSatelital l) {
        validar(l);
        if (regiaoDAO.buscarPorId(l.getIdRegiao()) == null)
            throw new Excecao("Regiao nao encontrada: " + l.getIdRegiao(), 404);
        return salvarComIA(l);
    }

    public void deletar(Long id) {
        buscarPorId(id);
        if (!leituraDAO.deletar(id)) throw new Excecao("Erro ao deletar leitura", 500);
    }

    // Salva no Oracle, chama Render IA e gera previsao + alerta automaticamente
    private LeituraSatelital salvarComIA(LeituraSatelital l) {
        LeituraSatelital salva = leituraDAO.inserir(l);

        // Render IA — falha aqui nao cancela o salvamento da leitura
        try {
            ResultadoIA resultado = renderIA.prever(salva);
            if (resultado.isSucesso()) {
                Previsao previsao = new Previsao();
                previsao.setIdLeitura(salva.getIdLeitura());
                previsao.setDsStatusVegetacao(resultado.getStatusVegetacao());
                previsao.setNrRiscoHidrico(resultado.getRiscoHidrico());
                previsao.setDsModeloUsado("RandomForest_v1");
                Previsao previsaoSalva = previsaoDAO.inserir(previsao);

                // Alerta automatico para risco >= 40%
                if (resultado.getRiscoHidrico() >= 40.0) {
                    Alerta alerta = new Alerta();
                    alerta.setIdPrevisao(previsaoSalva.getIdPrevisao());
                    alerta.setIdRegiao(salva.getIdRegiao());
                    alerta.setDsNivel(resultado.getNivelAlerta());
                    alerta.setDsMensagem(String.format(
                            "Regiao %d: risco %s! NDVI=%.3f, Risco=%.1f%%, Dias sem chuva=%d",
                            salva.getIdRegiao(), resultado.getNivelAlerta(), salva.getNrNdvi(),
                            resultado.getRiscoHidrico(),
                            salva.getNrDiasSemChuva() != null ? salva.getNrDiasSemChuva() : 0));
                    alertaDAO.inserir(alerta);
                }
            }
        } catch (Exception ignored) {
        }

        return salva;
    }

    private double estimarNdvi(String bioma) {
        double[] faixa = NDVI_BIOMA.getOrDefault(bioma, new double[]{0.20, 0.85});
        return Math.round((faixa[0] + Math.random() * (faixa[1] - faixa[0])) * 10000.0) / 10000.0;
    }

    private void validar(LeituraSatelital l) {
        if (l.getIdRegiao() == null)
            throw new Excecao("idRegiao e obrigatorio", 400);
        if (l.getNrNdvi() == null)
            throw new Excecao("NDVI e obrigatorio", 400);
        if (l.getNrNdvi() < -1 || l.getNrNdvi() > 1)
            throw new Excecao("NDVI deve estar entre -1 e 1", 400);
        if (l.getNrTemperatura() == null)
            throw new Excecao("Temperatura e obrigatoria", 400);
        if (l.getNrUmidade() != null && (l.getNrUmidade() < 0 || l.getNrUmidade() > 100))
            throw new Excecao("Umidade deve estar entre 0 e 100", 400);
        if (l.getNrDiasSemChuva() != null && l.getNrDiasSemChuva() < 0)
            throw new Excecao("Dias sem chuva nao pode ser negativo", 400);
    }
}
