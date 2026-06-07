package AgroSat.api;

import AgroSat.bo.UsuarioBO;
import AgroSat.vo.Usuario;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioApi {

    @Inject
    UsuarioBO bo;

    @GET
    public Response listar() {
        return Response.ok(bo.listarTodos()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        return Response.ok(bo.buscarPorId(id)).build();
    }

    @POST
    public Response inserir(Usuario u) {
        return Response.status(201).entity(bo.inserir(u)).build();
    }

    @PUT
    @Path("/{id}")
    public Response atualizar(@PathParam("id") Long id, Usuario u) {
        return Response.ok(bo.atualizar(id, u)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        bo.deletar(id);
        return Response.noContent().build();
    }
}
