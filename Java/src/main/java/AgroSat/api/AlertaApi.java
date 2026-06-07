package AgroSat.api;

import AgroSat.bo.AlertaBO;
import AgroSat.vo.HistoricoAlerta;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/alertas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlertaApi {

    @Inject
    AlertaBO bo;

    @GET
    public Response listar() {
        return Response.ok(bo.listarTodos()).build();
    }

    @GET
    @Path("/pendentes")
    public Response listarPendentes() {
        return Response.ok(bo.listarPendentes()).build();
    }

    @GET
    @Path("/regiao/{idRegiao}")
    public Response listarPorRegiao(@PathParam("idRegiao") Long idRegiao) {
        return Response.ok(bo.listarPorRegiao(idRegiao)).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        return Response.ok(bo.buscarPorId(id)).build();
    }

    @GET
    @Path("/{id}/historico")
    public Response listarHistorico(@PathParam("id") Long id) {
        return Response.ok(bo.listarHistorico(id)).build();
    }

    // idUsuario opcional — registra historico automaticamente se informado
    @PUT
    @Path("/{id}/resolver")
    public Response resolver(@PathParam("id") Long id, @QueryParam("idUsuario") Long idUsuario) {
        return Response.ok(bo.resolver(id, idUsuario)).build();
    }

    @POST
    @Path("/historico")
    public Response registrarAcao(HistoricoAlerta h) {
        return Response.status(201).entity(bo.registrarAcao(h)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        bo.deletar(id);
        return Response.noContent().build();
    }
}
