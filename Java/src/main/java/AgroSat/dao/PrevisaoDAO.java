package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Previsao;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class PrevisaoDAO {

    @Inject
    ConexaoBanco banco;

    private static final String SELECT = """
            SELECT p.id_previsao, p.id_leitura, p.ds_status_vegetacao, p.nr_risco_hidrico,
                   p.ds_modelo_usado, TO_CHAR(p.dt_previsao,'YYYY-MM-DD'),
                   r.nm_regiao, l.nr_ndvi, l.nr_temperatura
            FROM TB_PREVISAO p
            JOIN TB_LEITURA_SATELITAL l ON p.id_leitura = l.id_leitura
            JOIN TB_REGIAO r ON l.id_regiao = r.id_regiao
            """;

    public List<Previsao> listarTodas() {
        List<Previsao> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "ORDER BY p.dt_previsao DESC FETCH FIRST 50 ROWS ONLY");
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar previsoes: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public List<Previsao> listarPorRegiao(Long idRegiao) {
        List<Previsao> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE l.id_regiao = ? ORDER BY p.dt_previsao DESC FETCH FIRST 20 ROWS ONLY");
            ps.setLong(1, idRegiao);
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar previsoes: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public Previsao buscarPorId(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE p.id_previsao = ?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar previsao: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public Previsao buscarUltimaPorRegiao(Long idRegiao) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE l.id_regiao = ? ORDER BY p.dt_previsao DESC FETCH FIRST 1 ROWS ONLY");
            ps.setLong(1, idRegiao);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar ultima previsao: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public Previsao inserir(Previsao p) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("""
                    INSERT INTO TB_PREVISAO
                        (id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado, dt_previsao)
                    VALUES (?, ?, ?, ?, SYSDATE)
                    """, new String[]{"id_previsao"});
            ps.setLong(1, p.getIdLeitura());
            ps.setString(2, p.getDsStatusVegetacao());
            ps.setDouble(3, p.getNrRiscoHidrico());
            ps.setString(4, p.getDsModeloUsado() != null ? p.getDsModeloUsado() : "RandomForest_v1");
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) p.setIdPrevisao(rs.getLong(1));
            }
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir previsao: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return p;
    }

    private Previsao mapear(ResultSet rs) throws SQLException {
        Previsao p = new Previsao();
        p.setIdPrevisao(rs.getLong(1));
        p.setIdLeitura(rs.getLong(2));
        p.setDsStatusVegetacao(rs.getString(3));
        p.setNrRiscoHidrico(rs.getDouble(4));
        p.setDsModeloUsado(rs.getString(5));
        p.setDtPrevisao(rs.getString(6));
        p.setNmRegiao(rs.getString(7));
        p.setNrNdvi(rs.getDouble(8));
        p.setNrTemperatura(rs.getDouble(9));
        return p;
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
