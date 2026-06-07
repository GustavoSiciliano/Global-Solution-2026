package AgroSat.conexao;

import jakarta.enterprise.context.ApplicationScoped;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

// Conexao com o Oracle FIAP
@ApplicationScoped
public class ConexaoBanco {

    private static final String URL = "jdbc:oracle:thin:@oracle.fiap.com.br:1521:orcl";
    private static final String USUARIO = "RM568419";
    private static final String SENHA = "250204";

    public Connection getConexao() throws SQLException {
        return DriverManager.getConnection(URL, USUARIO, SENHA);
    }
}
