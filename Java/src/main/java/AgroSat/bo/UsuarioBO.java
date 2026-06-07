package AgroSat.bo;

import AgroSat.dao.UsuarioDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Usuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Set;

@ApplicationScoped
public class UsuarioBO {

    private static final Set<String> PERFIS = Set.of("ADMIN", "PRODUTOR", "GESTOR");

    @Inject
    UsuarioDAO dao;

    public List<Usuario> listarTodos() {
        return dao.listarTodos();
    }

    public Usuario buscarPorId(Long id) {
        Usuario u = dao.buscarPorId(id);
        if (u == null) throw new Excecao("Usuario nao encontrado: " + id, 404);
        return u;
    }

    public Usuario inserir(Usuario u) {
        validar(u, true);
        if (dao.emailExiste(u.getDsEmail()))
            throw new Excecao("Email ja cadastrado: " + u.getDsEmail(), 409);
        return dao.inserir(u);
    }

    public Usuario atualizar(Long id, Usuario u) {
        buscarPorId(id);
        validar(u, false);
        Usuario atualizado = dao.atualizar(id, u);
        if (atualizado == null) throw new Excecao("Erro ao atualizar usuario", 500);
        return atualizado;
    }

    public void deletar(Long id) {
        buscarPorId(id);
        if (!dao.deletar(id)) throw new Excecao("Erro ao deletar usuario", 500);
    }

    private void validar(Usuario u, boolean senhaObrigatoria) {
        if (u.getNmUsuario() == null || u.getNmUsuario().isBlank())
            throw new Excecao("Nome do usuario e obrigatorio", 400);
        if (u.getDsEmail() == null || !u.getDsEmail().contains("@"))
            throw new Excecao("Email invalido", 400);
        if (senhaObrigatoria && (u.getDsSenha() == null || u.getDsSenha().length() < 6))
            throw new Excecao("Senha deve ter no minimo 6 caracteres", 400);
        if (u.getDsPerfil() == null || !PERFIS.contains(u.getDsPerfil().toUpperCase()))
            throw new Excecao("Perfil invalido. Use: ADMIN, PRODUTOR ou GESTOR", 400);
    }
}
