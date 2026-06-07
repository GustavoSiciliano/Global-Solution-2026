package AgroSat.excecao;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.Map;

// Converte Excecao em JSON {"erro":"msg","status":404} para o frontend
@Provider
public class ManipuladorExcecao implements ExceptionMapper<Excecao> {

    @Override
    public Response toResponse(Excecao e) {
        return Response
                .status(e.getStatus())
                .entity(Map.of("erro", e.getMessage(), "status", e.getStatus()))
                .build();
    }
}
