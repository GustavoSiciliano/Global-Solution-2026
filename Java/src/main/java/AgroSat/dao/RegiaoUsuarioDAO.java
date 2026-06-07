package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.RegiaoUsuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class RegiaoUsuarioDAO {

    @Inject
    ConexaoBanco banco;

    private static final String SELECT = """
            SELECT ru.id_regiao_usuario,ru.id_regiao,ru.id_usuario,
                   TO_CHAR(ru.dt_vinculo,'YYYY-MM-DD'),r.nm_regiao,u.nm_usuario
            FROM TB_REGIAO_USUARIO ru
            JOIN TB_REGIAO r ON ru.id_regiao=r.id_regiao
            JOIN TB_USUARIO u ON ru.id_usuario=u.id_usuario
            """;

    public List<RegiaoUsuario> listarPorUsuario(Long idUsuario) {
        return executarLista(SELECT + "WHERE ru.id_usuario=? ORDER BY r.nm_regiao", idUsuario);
    }

    public List<RegiaoUsuario> listarPorRegiao(Long idRegiao) {
        return executarLista(SELECT + "WHERE ru.id_regiao=? ORDER BY u.nm_usuario", idRegiao);
    }

    public boolean vinculoExiste(Long idRegiao, Long idUsuario) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("SELECT COUNT(*) FROM TB_REGIAO_USUARIO WHERE id_regiao=? AND id_usuario=?");
            ps.setLong(1, idRegiao);
            ps.setLong(2, idUsuario);
            rs = ps.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        } catch (SQLException e) {
            throw new Excecao("Erro ao verificar vinculo: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public RegiaoUsuario inserir(RegiaoUsuario ru) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("INSERT INTO TB_REGIAO_USUARIO (id_regiao,id_usuario,dt_vinculo) VALUES (?,?,SYSDATE)", new String[]{"id_regiao_usuario"});
            ps.setLong(1, ru.getIdRegiao());
            ps.setLong(2, ru.getIdUsuario());
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) ru.setIdRegiaoUsuario(rs.getLong(1));
            }
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao vincular: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return ru;
    }

    public boolean deletar(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("DELETE FROM TB_REGIAO_USUARIO WHERE id_regiao_usuario=?");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao desvincular: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    private List<RegiaoUsuario> executarLista(String sql, Long param) {
        List<RegiaoUsuario> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(sql);
            if (param != null) ps.setLong(1, param);
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar vinculos: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    private RegiaoUsuario mapear(ResultSet rs) throws SQLException {
        RegiaoUsuario ru = new RegiaoUsuario();
        ru.setIdRegiaoUsuario(rs.getLong(1));
        ru.setIdRegiao(rs.getLong(2));
        ru.setIdUsuario(rs.getLong(3));
        ru.setDtVinculo(rs.getString(4));
        ru.setNmRegiao(rs.getString(5));
        ru.setNmUsuario(rs.getString(6));
        return ru;
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
