package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.Regiao;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class RegiaoDAO {

    @Inject
    ConexaoBanco banco;

    private static final String SELECT =
            "SELECT id_regiao, nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma, TO_CHAR(dt_cadastro,'YYYY-MM-DD') FROM TB_REGIAO";

    public List<Regiao> listarTodas() {
        List<Regiao> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + " ORDER BY nm_regiao");
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar regioes: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public Regiao buscarPorId(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + " WHERE id_regiao = ?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar regiao: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public List<Regiao> listarPorEstado(String estado) {
        List<Regiao> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + " WHERE ds_estado = ? ORDER BY nm_regiao");
            ps.setString(1, estado.toUpperCase());
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar por estado: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public Regiao buscarPorNome(String nome) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement(SELECT + " WHERE UPPER(nm_regiao) = UPPER(?)");
            ps.setString(1, nome);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar regiao por nome: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public Regiao inserir(Regiao r) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(
                    "INSERT INTO TB_REGIAO (nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma, dt_cadastro) VALUES (?, ?, ?, ?, ?, SYSDATE)",
                    new String[]{"id_regiao"});
            ps.setString(1, r.getNmRegiao());
            ps.setString(2, r.getDsEstado().toUpperCase());
            ps.setDouble(3, r.getNrLatitude());
            ps.setDouble(4, r.getNrLongitude());
            ps.setString(5, r.getDsBioma());
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) r.setIdRegiao(rs.getLong(1));
            }
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir regiao: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return r;
    }

    public Regiao atualizar(Long id, Regiao r) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(
                    "UPDATE TB_REGIAO SET nm_regiao=?, ds_estado=?, nr_latitude=?, nr_longitude=?, ds_bioma=? WHERE id_regiao=?");
            ps.setString(1, r.getNmRegiao());
            ps.setString(2, r.getDsEstado().toUpperCase());
            ps.setDouble(3, r.getNrLatitude());
            ps.setDouble(4, r.getNrLongitude());
            ps.setString(5, r.getDsBioma());
            ps.setLong(6, id);
            int rows = ps.executeUpdate();
            conn.commit();
            if (rows == 0) return null;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao atualizar regiao: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        r.setIdRegiao(id);
        return r;
    }

    public boolean deletar(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("DELETE FROM TB_REGIAO WHERE id_regiao = ?");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao deletar regiao: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    private Regiao mapear(ResultSet rs) throws SQLException {
        Regiao r = new Regiao();
        r.setIdRegiao(rs.getLong(1));
        r.setNmRegiao(rs.getString(2));
        r.setDsEstado(rs.getString(3));
        r.setNrLatitude(rs.getDouble(4));
        r.setNrLongitude(rs.getDouble(5));
        r.setDsBioma(rs.getString(6));
        r.setDtCadastro(rs.getString(7));
        return r;
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
