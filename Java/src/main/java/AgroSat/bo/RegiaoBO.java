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

    // Cadastra regiao a partir do nome da cidade e estado
    // Nominatim busca as coordenadas, INPE identifica o bioma
    // Se a cidade nao tiver bioma identificado, registra como "Nao identificado"
    public Regiao buscarPorCidade(String nmCidade, String dsEstado) {
        if (nmCidade == null || nmCidade.isBlank())
            throw new Excecao("Nome da cidade e obrigatorio", 400);
        if (dsEstado == null || !ESTADOS.contains(dsEstado.toUpperCase()))
            throw new Excecao("Estado invalido: " + dsEstado, 400);

        // Verifica se ja existe no banco
        Regiao existente = dao.buscarPorNome(nmCidade);
        if (existente != null) return existente;

        // Nominatim — coordenadas geograficas
        double[] coords = apiNominatim.buscarCoordenadas(nmCidade, dsEstado);
        if (coords == null)
            throw new Excecao("Cidade nao localizada: " + nmCidade + " - " + dsEstado + ". Verifique o nome e a sigla.", 404);

        // INPE — bioma (cidades urbanas como Diadema/SP podem nao ter bioma especifico)
        String bioma = apiInpe.buscarBioma(coords[0], coords[1]);
        if (bioma == null) bioma = "Nao identificado";

        Regiao regiao = new Regiao();
        regiao.setNmRegiao(nmCidade);
        regiao.setDsEstado(dsEstado.toUpperCase());
        regiao.setNrLatitude(coords[0]);
        regiao.setNrLongitude(coords[1]);
        regiao.setDsBioma(bioma);
        return dao.inserir(regiao);
    }

    // Busca pelo CEP via ViaCEP, obtém coordenadas e bioma automaticamente
    // Retorna a regiao com a ultima leitura, previsao e alertas pendentes do banco
    public SituacaoRegiao buscarSituacaoPorCep(String cep) {
        if (cep == null || cep.replaceAll("[^0-9]", "").length() != 8)
            throw new Excecao("CEP invalido. Informe 8 digitos.", 400);

        Map<String, String> endereco = apiViaCep.buscarPorCep(cep);
        if (endereco.isEmpty())
            throw new Excecao("CEP nao encontrado: " + cep, 404);

        String cidade = endereco.get("localidade");
        String estado = endereco.get("uf");

        double[] coords = apiNominatim.buscarCoordenadas(cidade, estado);
        if (coords == null)
            throw new Excecao("Coordenadas nao encontradas para: " + cidade + "/" + estado, 404);

        String bioma = apiInpe.buscarBioma(coords[0], coords[1]);
        if (bioma == null) bioma = "Nao identificado";

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