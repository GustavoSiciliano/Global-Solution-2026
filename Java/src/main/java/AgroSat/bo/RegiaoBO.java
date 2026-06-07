package AgroSat.bo;

import AgroSat.conexao.ApiInpe;
import AgroSat.conexao.ApiNominatim;
import AgroSat.conexao.ApiViaCep;
import AgroSat.dao.AlertaDAO;
import AgroSat.dao.LeituraDAO;
import AgroSat.dao.PrevisaoDAO;
import AgroSat.dao.RegiaoDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Regiao;
import AgroSat.vo.SituacaoRegiao;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class RegiaoBO {

    private static final Set<String> ESTADOS = Set.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
            "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    );

    @Inject
    RegiaoDAO dao;
    @Inject
    LeituraDAO leituraDAO;
    @Inject
    PrevisaoDAO previsaoDAO;
    @Inject
    AlertaDAO alertaDAO;
    @Inject
    ApiViaCep apiViaCep;
    @Inject
    ApiNominatim apiNominatim;
    @Inject
    ApiInpe apiInpe;

    public List<Regiao> listarTodas() {
        return dao.listarTodas();
    }

    public Regiao buscarPorId(Long id) {
        Regiao r = dao.buscarPorId(id);
        if (r == null) throw new Excecao("Regiao nao encontrada: " + id, 404);
        return r;
    }

    public List<Regiao> listarPorEstado(String estado) {
        if (estado == null || !ESTADOS.contains(estado.toUpperCase()))
            throw new Excecao("Estado invalido: " + estado, 400);
        return dao.listarPorEstado(estado);
    }

    public Regiao inserir(Regiao r) {
        validar(r);
        return dao.inserir(r);
    }

    public Regiao atualizar(Long id, Regiao r) {
        buscarPorId(id);
        validar(r);
        Regiao atualizada = dao.atualizar(id, r);
        if (atualizada == null) throw new Excecao("Erro ao atualizar regiao", 500);
        return atualizada;
    }

    public void deletar(Long id) {
        buscarPorId(id);
        if (!dao.deletar(id)) throw new Excecao("Erro ao deletar regiao", 500);
    }

    // Busca coordenadas e bioma automaticamente pelo CEP e retorna a situacao agricola atual
    public SituacaoRegiao buscarSituacaoPorCep(String cep) {
        if (cep == null || cep.replaceAll("[^0-9]", "").length() != 8)
            throw new Excecao("CEP invalido. Use o formato 00000-000 ou 00000000", 400);

        // 1. ViaCEP — cidade e estado
        Map<String, String> endereco = apiViaCep.buscarPorCep(cep);
        if (endereco.isEmpty())
            throw new Excecao("CEP nao encontrado: " + cep, 404);

        String cidade = endereco.get("localidade");
        String estado = endereco.get("uf");

        // 2. Nominatim — coordenadas
        double[] coords = apiNominatim.buscarCoordenadas(cidade, estado);
        if (coords == null)
            throw new Excecao("Coordenadas nao encontradas para: " + cidade + "/" + estado, 404);

        // 3. INPE — bioma (com fallback)
        String bioma = apiInpe.buscarBioma(coords[0], coords[1]);
        if (bioma == null) bioma = "Nao identificado";

        // 4. Verifica se regiao ja existe no banco pelo nome
        Regiao regiao = dao.buscarPorNome(cidade);
        if (regiao == null) {
            regiao = new Regiao();
            regiao.setNmRegiao(cidade);
            regiao.setDsEstado(estado);
            regiao.setNrLatitude(coords[0]);
            regiao.setNrLongitude(coords[1]);
            regiao.setDsBioma(bioma);
            regiao = dao.inserir(regiao);
        }

        // 5. Monta situacao atual com dados do banco
        SituacaoRegiao situacao = new SituacaoRegiao();
        situacao.setRegiao(regiao);
        situacao.setUltimaLeitura(leituraDAO.buscarUltimaPorRegiao(regiao.getIdRegiao()));
        situacao.setUltimaPrevisao(previsaoDAO.buscarUltimaPorRegiao(regiao.getIdRegiao()));
        situacao.setAlertasPendentes(alertaDAO.listarPendentesPorRegiao(regiao.getIdRegiao()));
        return situacao;
    }

    private void validar(Regiao r) {
        if (r.getNmRegiao() == null || r.getNmRegiao().isBlank())
            throw new Excecao("Nome da regiao e obrigatorio", 400);
        if (r.getDsEstado() == null || !ESTADOS.contains(r.getDsEstado().toUpperCase()))
            throw new Excecao("Estado invalido: " + r.getDsEstado(), 400);
        if (r.getNrLatitude() == null)
            throw new Excecao("Latitude e obrigatoria", 400);
        if (r.getNrLongitude() == null)
            throw new Excecao("Longitude e obrigatoria", 400);
        if (r.getNrLatitude() < -90 || r.getNrLatitude() > 90)
            throw new Excecao("Latitude deve estar entre -90 e 90", 400);
        if (r.getNrLongitude() < -180 || r.getNrLongitude() > 180)
            throw new Excecao("Longitude deve estar entre -180 e 180", 400);
    }
}
