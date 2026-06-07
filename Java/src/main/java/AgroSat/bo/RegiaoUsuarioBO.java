package AgroSat.bo;

import AgroSat.dao.RegiaoDAO;
import AgroSat.dao.RegiaoUsuarioDAO;
import AgroSat.dao.UsuarioDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.RegiaoUsuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class RegiaoUsuarioBO {

    @Inject
    RegiaoUsuarioDAO dao;
    @Inject
    RegiaoDAO regiaoDAO;
    @Inject
    UsuarioDAO usuarioDAO;

    public List<RegiaoUsuario> listarPorUsuario(Long idUsuario) {
        if (usuarioDAO.buscarPorId(idUsuario) == null)
            throw new Excecao("Usuario nao encontrado: " + idUsuario, 404);
        return dao.listarPorUsuario(idUsuario);
    }

    public List<RegiaoUsuario> listarPorRegiao(Long idRegiao) {
        if (regiaoDAO.buscarPorId(idRegiao) == null)
            throw new Excecao("Regiao nao encontrada: " + idRegiao, 404);
        return dao.listarPorRegiao(idRegiao);
    }

    public RegiaoUsuario vincular(RegiaoUsuario ru) {
        if (ru.getIdRegiao() == null) throw new Excecao("idRegiao e obrigatorio", 400);
        if (ru.getIdUsuario() == null) throw new Excecao("idUsuario e obrigatorio", 400);
        if (regiaoDAO.buscarPorId(ru.getIdRegiao()) == null)
            throw new Excecao("Regiao nao encontrada: " + ru.getIdRegiao(), 404);
        if (usuarioDAO.buscarPorId(ru.getIdUsuario()) == null)
            throw new Excecao("Usuario nao encontrado: " + ru.getIdUsuario(), 404);
        if (dao.vinculoExiste(ru.getIdRegiao(), ru.getIdUsuario()))
            throw new Excecao("Vinculo ja existe", 409);
        return dao.inserir(ru);
    }

    public void desvincular(Long id) {
        if (!dao.deletar(id)) throw new Excecao("Vinculo nao encontrado: " + id, 404);
    }
}
