package AgroSat.bo;

import AgroSat.dao.AlertaDAO;
import AgroSat.dao.HistoricoAlertaDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.HistoricoAlerta;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Set;

@ApplicationScoped
public class HistoricoAlertaBO {

    private static final Set<String> ACOES = Set.of("VISUALIZADO", "RECONHECIDO", "RESOLVIDO", "IGNORADO");

    @Inject
    HistoricoAlertaDAO dao;
    @Inject
    AlertaDAO alertaDAO;

    public List<HistoricoAlerta> listarPorAlerta(Long idAlerta) {
        if (alertaDAO.buscarPorId(idAlerta) == null)
            throw new Excecao("Alerta nao encontrado: " + idAlerta, 404);
        return dao.listarPorAlerta(idAlerta);
    }

    public HistoricoAlerta registrarAcao(HistoricoAlerta h) {
        if (h.getIdAlerta() == null) throw new Excecao("idAlerta e obrigatorio", 400);
        if (h.getIdUsuario() == null) throw new Excecao("idUsuario e obrigatorio", 400);
        if (h.getDsAcao() == null || !ACOES.contains(h.getDsAcao()))
            throw new Excecao("Acao invalida. Use: VISUALIZADO, RECONHECIDO, RESOLVIDO ou IGNORADO", 400);
        if (alertaDAO.buscarPorId(h.getIdAlerta()) == null)
            throw new Excecao("Alerta nao encontrado: " + h.getIdAlerta(), 404);
        return dao.inserir(h);
    }
}
