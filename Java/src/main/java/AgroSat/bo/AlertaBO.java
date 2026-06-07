package AgroSat.bo;

import AgroSat.dao.AlertaDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Alerta;
import AgroSat.vo.HistoricoAlerta;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class AlertaBO {

    @Inject
    AlertaDAO alertaDAO;
    @Inject
    HistoricoAlertaBO historicoBO;

    public List<Alerta> listarTodos() {
        return alertaDAO.listarTodos();
    }

    public List<Alerta> listarPendentes() {
        return alertaDAO.listarPendentes();
    }

    public List<Alerta> listarPorRegiao(Long idRegiao) {
        return alertaDAO.listarPorRegiao(idRegiao);
    }

    public Alerta buscarPorId(Long id) {
        Alerta a = alertaDAO.buscarPorId(id);
        if (a == null) throw new Excecao("Alerta nao encontrado: " + id, 404);
        return a;
    }

    // Resolve o alerta e delega registro de historico ao HistoricoAlertaBO
    public Alerta resolver(Long id, Long idUsuario) {
        Alerta a = buscarPorId(id);
        if ("S".equals(a.getFlResolvido())) throw new Excecao("Alerta ja esta resolvido", 400);
        if (!alertaDAO.resolver(id)) throw new Excecao("Erro ao resolver alerta", 500);
        if (idUsuario != null) {
            HistoricoAlerta h = new HistoricoAlerta();
            h.setIdAlerta(id);
            h.setIdUsuario(idUsuario);
            h.setDsAcao("RESOLVIDO");
            historicoBO.registrarAcao(h);
        }
        a.setFlResolvido("S");
        return a;
    }

    public List<HistoricoAlerta> listarHistorico(Long idAlerta) {
        return historicoBO.listarPorAlerta(idAlerta);
    }

    public HistoricoAlerta registrarAcao(HistoricoAlerta h) {
        return historicoBO.registrarAcao(h);
    }

    public void deletar(Long id) {
        buscarPorId(id);
        if (!alertaDAO.deletar(id)) throw new Excecao("Erro ao deletar alerta", 500);
    }
}
