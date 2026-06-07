package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Alerta;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AlertaDAO {

    @Inject
    ConexaoBanco banco;

    private static final String SELECT = """
            SELECT a.id_alerta, a.id_previsao, a.id_regiao, a.ds_nivel, a.ds_mensagem,
                   a.fl_resolvido, TO_CHAR(a.dt_alerta,'YYYY-MM-DD'), r.nm_regiao, r.ds_estado
            FROM TB_ALERTA a
            JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
            """;

    private static final String ORDER_NIVEL = """
            ORDER BY CASE a.ds_nivel
                WHEN 'CRITICO' THEN 1 WHEN 'ALTO' THEN 2
                WHEN 'MEDIO' THEN 3 WHEN 'BAIXO' THEN 4 ELSE 5
            END, a.dt_alerta DESC
            """;

    public List<Alerta> listarTodos() {
        return executarLista(SELECT + ORDER_NIVEL, null);
    }

    public List<Alerta> listarPendentes() {
        return executarLista(SELECT + "WHERE a.fl_resolvido = 'N' " + ORDER_NIVEL, null);
    }

    public List<Alerta> listarPorRegiao(Long idRegiao) {
        return executarLista(SELECT + "WHERE a.id_regiao = ? " + ORDER_NIVEL, idRegiao);
    }

    public List<Alerta> listarPendentesPorRegiao(Long idRegiao) {
        return executarLista(SELECT + "WHERE a.id_regiao = ? AND a.fl_resolvido = 'N' " + ORDER_NIVEL, idRegiao);
    }

    public Alerta buscarPorId(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE a.id_alerta = ?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar alerta: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public Alerta inserir(Alerta a) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("""
                    INSERT INTO TB_ALERTA
                        (id_previsao, id_regiao, ds_nivel, ds_mensagem, fl_resolvido, dt_alerta)
                    VALUES (?, ?, ?, ?, 'N', SYSDATE)
                    """, new String[]{"id_alerta"});
            ps.setLong(1, a.getIdPrevisao());
            ps.setLong(2, a.getIdRegiao());
            ps.setString(3, a.getDsNivel());
            ps.setString(4, a.getDsMensagem());
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) a.setIdAlerta(rs.getLong(1));
            }
            a.setFlResolvido("N");
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir alerta: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return a;
    }

    public boolean resolver(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("UPDATE TB_ALERTA SET fl_resolvido = 'S' WHERE id_alerta = ? AND fl_resolvido = 'N'");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao resolver alerta: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    public boolean deletar(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("DELETE FROM TB_ALERTA WHERE id_alerta = ?");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao deletar alerta: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    private List<Alerta> executarLista(String sql, Long param) {
        List<Alerta> lista = new ArrayList<>();
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
            throw new Excecao("Erro ao listar alertas: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    private Alerta mapear(ResultSet rs) throws SQLException {
        Alerta a = new Alerta();
        a.setIdAlerta(rs.getLong(1));
        a.setIdPrevisao(rs.getLong(2));
        a.setIdRegiao(rs.getLong(3));
        a.setDsNivel(rs.getString(4));
        a.setDsMensagem(rs.getString(5));
        a.setFlResolvido(rs.getString(6));
        a.setDtAlerta(rs.getString(7));
        a.setNmRegiao(rs.getString(8));
        a.setDsEstado(rs.getString(9));
        return a;
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
