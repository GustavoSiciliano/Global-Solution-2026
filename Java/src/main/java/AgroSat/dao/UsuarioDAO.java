package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Usuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class UsuarioDAO {

    @Inject
    ConexaoBanco banco;

    public List<Usuario> listarTodos() {
        List<Usuario> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("SELECT id_usuario,nm_usuario,ds_email,ds_perfil,TO_CHAR(dt_cadastro,'YYYY-MM-DD') FROM TB_USUARIO ORDER BY nm_usuario");
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar usuarios: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public Usuario buscarPorId(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("SELECT id_usuario,nm_usuario,ds_email,ds_perfil,TO_CHAR(dt_cadastro,'YYYY-MM-DD') FROM TB_USUARIO WHERE id_usuario=?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar usuario: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public boolean emailExiste(String email) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("SELECT COUNT(*) FROM TB_USUARIO WHERE ds_email=?");
            ps.setString(1, email);
            rs = ps.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        } catch (SQLException e) {
            throw new Excecao("Erro ao verificar email: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public Usuario inserir(Usuario u) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("INSERT INTO TB_USUARIO (nm_usuario,ds_email,ds_senha,ds_perfil,dt_cadastro) VALUES (?,?,?,?,SYSDATE)", new String[]{"id_usuario"});
            ps.setString(1, u.getNmUsuario());
            ps.setString(2, u.getDsEmail().toLowerCase());
            ps.setString(3, u.getDsSenha());
            ps.setString(4, u.getDsPerfil().toUpperCase());
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) u.setIdUsuario(rs.getLong(1));
            }
            u.setDsSenha(null);
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir usuario: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return u;
    }

    public Usuario atualizar(Long id, Usuario u) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("UPDATE TB_USUARIO SET nm_usuario=?,ds_email=?,ds_perfil=? WHERE id_usuario=?");
            ps.setString(1, u.getNmUsuario());
            ps.setString(2, u.getDsEmail().toLowerCase());
            ps.setString(3, u.getDsPerfil().toUpperCase());
            ps.setLong(4, id);
            int rows = ps.executeUpdate();
            conn.commit();
            if (rows == 0) return null;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao atualizar usuario: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        u.setIdUsuario(id);
        u.setDsSenha(null);
        return u;
    }

    public boolean deletar(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("DELETE FROM TB_USUARIO WHERE id_usuario=?");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao deletar usuario: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    private Usuario mapear(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setIdUsuario(rs.getLong(1));
        u.setNmUsuario(rs.getString(2));
        u.setDsEmail(rs.getString(3));
        u.setDsPerfil(rs.getString(4));
        u.setDtCadastro(rs.getString(5));
        return u;
    }

    private void rollback(Connection c) {
        if (c != null) try {
            c.rollback();
        } catch (SQLException ignored) {
        }
    }

    private void fechar(ResultSet rs, PreparedStatement ps, Connection c) {
        if (rs != null) try {
            rs.close();
        } catch (SQLException ignored) {
        }
        if (ps != null) try {
            ps.close();
        } catch (SQLException ignored) {
        }
        if (c != null) try {
            c.close();
        } catch (SQLException ignored) {
        }
    }
}
