package AgroSat.api;

import AgroSat.bo.PrevisaoBO;
import AgroSat.vo.Previsao;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/previsoes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PrevisaoApi {

    @Inject
    PrevisaoBO bo;

    @GET
    public Response listar() {
        return Response.ok(bo.listarTodas()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        return Response.ok(bo.buscarPorId(id)).build();
    }

    @GET
    @Path("/regiao/{idRegiao}")
    public Response listarPorRegiao(@PathParam("idRegiao") Long idRegiao) {
        return Response.ok(bo.listarPorRegiao(idRegiao)).build();
    }

    @POST
    public Response inserir(Previsao p) {
        return Response.status(201).entity(bo.inserir(p)).build();
    }
}
