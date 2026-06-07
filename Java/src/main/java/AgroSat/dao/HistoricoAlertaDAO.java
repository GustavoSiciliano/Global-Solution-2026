package AgroSat.dao;

import AgroSat.conexao.ConexaoBanco;
import AgroSat.excecao.Excecao;
import AgroSat.vo.HistoricoAlerta;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class HistoricoAlertaDAO {

    @Inject
    ConexaoBanco banco;

    public List<HistoricoAlerta> listarPorAlerta(Long idAlerta) {
        List<HistoricoAlerta> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = banco.getConexao();
            ps = conn.prepareStatement("""
                    SELECT h.id_historico,h.id_alerta,h.id_usuario,h.ds_acao,h.ds_observacao,
                           TO_CHAR(h.dt_acao,'YYYY-MM-DD HH24:MI:SS'),u.nm_usuario,r.nm_regiao
                    FROM TB_HISTORICO_ALERTA h
                    JOIN TB_USUARIO u ON h.id_usuario=u.id_usuario
                    JOIN TB_ALERTA a ON h.id_alerta=a.id_alerta
                    JOIN TB_REGIAO r ON a.id_regiao=r.id_regiao
                    WHERE h.id_alerta=? ORDER BY h.dt_acao DESC
                    """);
            ps.setLong(1, idAlerta);
            rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            throw new Excecao("Erro ao listar historico: " + e.getMessage(), 500);
        } finally {
            fechar(rs, ps, conn);
        }
        return lista;
    }

    public HistoricoAlerta inserir(HistoricoAlerta h) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = banco.getConexao();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement("INSERT INTO TB_HISTORICO_ALERTA (id_alerta,id_usuario,ds_acao,ds_observacao,dt_acao) VALUES (?,?,?,?,SYSDATE)", new String[]{"id_historico"});
            ps.setLong(1, h.getIdAlerta());
            ps.setLong(2, h.getIdUsuario());
            ps.setString(3, h.getDsAcao());
            ps.setString(4, h.getDsObservacao());
            ps.executeUpdate();
            conn.commit();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) h.setIdHistorico(rs.getLong(1));
            }
        } catch (SQLException e) {
            rollback(conn);
            throw new Excecao("Erro ao inserir historico: " + e.getMessage(), 500);
        } finally {
            fechar(null, ps, conn);
        }
        return h;
    }

    private HistoricoAlerta mapear(ResultSet rs) throws SQLException {
        HistoricoAlerta h = new HistoricoAlerta();
        h.setIdHistorico(rs.getLong(1));
        h.setIdAlerta(rs.getLong(2));
        h.setIdUsuario(rs.getLong(3));
        h.setDsAcao(rs.getString(4));
        h.setDsObservacao(rs.getString(5));
        h.setDtAcao(rs.getString(6));
        h.setNmUsuario(rs.getString(7));
        h.setNmRegiao(rs.getString(8));
        return h;
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
