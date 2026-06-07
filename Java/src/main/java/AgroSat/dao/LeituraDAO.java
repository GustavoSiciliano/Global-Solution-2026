package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.LeituraSatelital;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class LeituraDAO {

    @Inject
    ConexaoBanco banco;

    private static final String SELECT = """
            SELECT l.id_leitura, l.id_regiao, l.id_fonte, l.nr_ndvi, l.nr_temperatura,
                   l.nr_precipitacao, l.nr_umidade, l.nr_dias_sem_chuva, l.nr_radiacao_solar,
                   TO_CHAR(l.dt_leitura,'YYYY-MM-DD'), r.nm_regiao, f.nm_fonte
            FROM TB_LEITURA_SATELITAL l
            JOIN TB_REGIAO r ON l.id_regiao = r.id_regiao
            JOIN TB_FONTE_SATELITAL f ON l.id_fonte = f.id_fonte
            """;

    public List<LeituraSatelital> listarTodas() {
        List<LeituraSatelital> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "ORDER BY l.dt_leitura DESC FETCH FIRST 50 ROWS ONLY");
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar leituras: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public List<LeituraSatelital> listarPorRegiao(Long idRegiao) {
        List<LeituraSatelital> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE l.id_regiao = ? ORDER BY l.dt_leitura DESC FETCH FIRST 20 ROWS ONLY");
            ps.setLong(1, idRegiao);
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar leituras: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public LeituraSatelital buscarPorId(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE l.id_leitura = ?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar leitura: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public LeituraSatelital buscarUltimaPorRegiao(Long idRegiao) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + "WHERE l.id_regiao = ? ORDER BY l.dt_leitura DESC FETCH FIRST 1 ROWS ONLY");
            ps.setLong(1, idRegiao);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar ultima leitura: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public LeituraSatelital inserir(LeituraSatelital l) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("""
                    INSERT INTO TB_LEITURA_SATELITAL
                        (id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao,
                         nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar, dt_leitura)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, SYSDATE)
                    """, new String[]{"id_leitura"});
            ps.setLong(1, l.getIdRegiao());
            ps.setLong(2, l.getIdFonte() != null ? l.getIdFonte() : 2L);
            ps.setDouble(3, l.getNrNdvi());
            ps.setDouble(4, l.getNrTemperatura());
            ps.setDouble(5, l.getNrPrecipitacao() != null ? l.getNrPrecipitacao() : 0.0);
            ps.setDouble(6, l.getNrUmidade() != null ? l.getNrUmidade() : 50.0);
            ps.setInt(7, l.getNrDiasSemChuva() != null ? l.getNrDiasSemChuva() : 0);
            ps.setDouble(8, l.getNrRadiacaoSolar() != null ? l.getNrRadiacaoSolar() : 20.0);
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) l.setIdLeitura(rs.getLong(1));
            }
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir leitura: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return l;
    }

    public boolean deletar(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("DELETE FROM TB_LEITURA_SATELITAL WHERE id_leitura = ?");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao deletar leitura: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    private LeituraSatelital mapear(ResultSet rs) throws SQLException {
        LeituraSatelital l = new LeituraSatelital();
        l.setIdLeitura(rs.getLong(1));
        l.setIdRegiao(rs.getLong(2));
        l.setIdFonte(rs.getLong(3));
        l.setNrNdvi(rs.getDouble(4));
        l.setNrTemperatura(rs.getDouble(5));
        l.setNrPrecipitacao(rs.getDouble(6));
        l.setNrUmidade(rs.getDouble(7));
        l.setNrDiasSemChuva(rs.getInt(8));
        l.setNrRadiacaoSolar(rs.getDouble(9));
        l.setDtLeitura(rs.getString(10));
        l.setNmRegiao(rs.getString(11));
        l.setNmFonte(rs.getString(12));
        return l;
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
