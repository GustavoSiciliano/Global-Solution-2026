package AgroSat.api;

import AgroSat.bo.FonteSatelitalBO;
import AgroSat.vo.FonteSatelital;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

// Endpoints para fontes satelitais (NASA, INPE, Open-Meteo, etc.)
@Path("/fontes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FonteSatelitalApi {

    @Inject
    FonteSatelitalBO bo;

    @GET
    public Response listar() {
        return Response.ok(bo.listarTodas()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        return Response.ok(bo.buscarPorId(id)).build();
    }

    @POST
    public Response inserir(FonteSatelital f) {
        return Response.status(201).entity(bo.inserir(f)).build();
    }

    @PUT
    @Path("/{id}")
    public Response atualizar(@PathParam("id") Long id, FonteSatelital f) {
        return Response.ok(bo.atualizar(id, f)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        bo.deletar(id);
        return Response.noContent().build();
    }
}
