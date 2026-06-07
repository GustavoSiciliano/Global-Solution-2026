package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.FonteSatelital;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class FonteSatelitalDAO {

    @Inject
    ConexaoBanco banco;

    public List<FonteSatelital> listarTodas() {
        List<FonteSatelital> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("SELECT id_fonte,nm_fonte,ds_url,ds_tipo_dado,ds_descricao,TO_CHAR(dt_cadastro,'YYYY-MM-DD') FROM TB_FONTE_SATELITAL ORDER BY nm_fonte");
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar fontes: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public FonteSatelital buscarPorId(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("SELECT id_fonte,nm_fonte,ds_url,ds_tipo_dado,ds_descricao,TO_CHAR(dt_cadastro,'YYYY-MM-DD') FROM TB_FONTE_SATELITAL WHERE id_fonte=?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        } catch (SQLException e) {
            throw new Excecao("Erro ao buscar fonte: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
    }

    public FonteSatelital inserir(FonteSatelital f) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("INSERT INTO TB_FONTE_SATELITAL (nm_fonte,ds_url,ds_tipo_dado,ds_descricao,dt_cadastro) VALUES (?,?,?,?,SYSDATE)", new String[]{"id_fonte"});
            ps.setString(1, f.getNmFonte());
            ps.setString(2, f.getDsUrl());
            ps.setString(3, f.getDsTipoDado());
            ps.setString(4, f.getDsDescricao());
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) f.setIdFonte(rs.getLong(1));
            }
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir fonte: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return f;
    }

    public FonteSatelital atualizar(Long id, FonteSatelital f) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("UPDATE TB_FONTE_SATELITAL SET nm_fonte=?,ds_url=?,ds_tipo_dado=?,ds_descricao=? WHERE id_fonte=?");
            ps.setString(1, f.getNmFonte());
            ps.setString(2, f.getDsUrl());
            ps.setString(3, f.getDsTipoDado());
            ps.setString(4, f.getDsDescricao());
            ps.setLong(5, id);
            int rows = ps.executeUpdate();
            conn.commit();
            if (rows == 0) return null;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao atualizar fonte: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        f.setIdFonte(id);
        return f;
    }

    public boolean deletar(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("DELETE FROM TB_FONTE_SATELITAL WHERE id_fonte=?");
            ps.setLong(1, id);
            int rows = ps.executeUpdate();
            conn.commit();
            return rows > 0;
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao deletar fonte: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
    }

    private FonteSatelital mapear(ResultSet rs) throws SQLException {
        FonteSatelital f = new FonteSatelital();
        f.setIdFonte(rs.getLong(1));
        f.setNmFonte(rs.getString(2));
        f.setDsUrl(rs.getString(3));
        f.setDsTipoDado(rs.getString(4));
        f.setDsDescricao(rs.getString(5));
        f.setDtCadastro(rs.getString(6));
        return f;
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
