package AgroSat.bo;

import AgroSat.dao.LeituraDAO;
import AgroSat.dao.PrevisaoDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Previsao;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Set;

@ApplicationScoped
public class PrevisaoBO {

    private static final Set<String> STATUS = Set.of("SAUDAVEL", "EM_ESTRESSE", "CRITICO");

    @Inject
    PrevisaoDAO previsaoDAO;
    @Inject
    LeituraDAO leituraDAO;

    public List<Previsao> listarTodas() {
        return previsaoDAO.listarTodas();
    }

    public List<Previsao> listarPorRegiao(Long idRegiao) {
        return previsaoDAO.listarPorRegiao(idRegiao);
    }

    public Previsao buscarPorId(Long id) {
        Previsao p = previsaoDAO.buscarPorId(id);
        if (p == null) throw new Excecao("Previsao nao encontrada: " + id, 404);
        return p;
    }

    public Previsao inserir(Previsao p) {
        validar(p);
        if (leituraDAO.buscarPorId(p.getIdLeitura()) == null)
            throw new Excecao("Leitura nao encontrada: " + p.getIdLeitura(), 404);
        return previsaoDAO.inserir(p);
    }

    private void validar(Previsao p) {
        if (p.getIdLeitura() == null)
            throw new Excecao("idLeitura e obrigatorio", 400);
        if (p.getDsStatusVegetacao() == null || !STATUS.contains(p.getDsStatusVegetacao()))
            throw new Excecao("Status invalido. Use: SAUDAVEL, EM_ESTRESSE ou CRITICO", 400);
        if (p.getNrRiscoHidrico() == null)
            throw new Excecao("Risco hidrico e obrigatorio", 400);
        if (p.getNrRiscoHidrico() < 0 || p.getNrRiscoHidrico() > 100)
            throw new Excecao("Risco hidrico deve estar entre 0 e 100", 400);
    }
}
