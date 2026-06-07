package AgroSat.api;

import AgroSat.bo.RegiaoUsuarioBO;
import AgroSat.vo.RegiaoUsuario;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/regioes-usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RegiaoUsuarioApi {

    @Inject
    RegiaoUsuarioBO bo;

    @GET
    @Path("/usuario/{idUsuario}")
    public Response listarPorUsuario(@PathParam("idUsuario") Long idUsuario) {
        return Response.ok(bo.listarPorUsuario(idUsuario)).build();
    }

    @GET
    @Path("/regiao/{idRegiao}")
    public Response listarPorRegiao(@PathParam("idRegiao") Long idRegiao) {
        return Response.ok(bo.listarPorRegiao(idRegiao)).build();
    }

    @POST
    public Response vincular(RegiaoUsuario ru) {
        return Response.status(201).entity(bo.vincular(ru)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response desvincular(@PathParam("id") Long id) {
        bo.desvincular(id);
        return Response.noContent().build();
    }
}
