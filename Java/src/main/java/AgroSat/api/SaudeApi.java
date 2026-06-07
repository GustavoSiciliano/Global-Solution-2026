package AgroSat.api;

import AgroSat.conexao.ConexaoBanco;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

// Health check — verifica Oracle em tempo real
@Path("/health")
@Produces(MediaType.APPLICATION_JSON)
public class SaudeApi {

    @Inject
    ConexaoBanco banco;

    @GET
    public Response verificar() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "ok");
        status.put("servico", "AgroSat Java API");
        status.put("versao", "1.0.0");
        try (Connection conn = banco.getConexao()) {
            status.put("oracle", conn.isValid(3) ? "conectado" : "falha");
        } catch (Exception e) {
            status.put("oracle", "indisponivel: " + e.getMessage());
        }
        return Response.ok(status).build();
    }
}
