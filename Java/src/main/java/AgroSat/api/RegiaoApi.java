package AgroSat.api;

import AgroSat.bo.RegiaoBO;
import AgroSat.vo.Regiao;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

// Endpoints de regioes agricolas — inclui busca automatica por CEP
@Path("/regioes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RegiaoApi {

    @Inject
    RegiaoBO bo;

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
    @Path("/estado/{estado}")
    public Response listarPorEstado(@PathParam("estado") String estado) {
        return Response.ok(bo.listarPorEstado(estado)).build();
    }

    @POST
    public Response inserir(Regiao r) {
        return Response.status(201).entity(bo.inserir(r)).build();
    }

    @PUT
    @Path("/{id}")
    public Response atualizar(@PathParam("id") Long id, Regiao r) {
        return Response.ok(bo.atualizar(id, r)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        bo.deletar(id);
        return Response.noContent().build();
    }

    // Busca coordenadas/bioma pelo CEP e retorna situacao agricola atual do banco
    @GET
    @Path("/situacao/cep/{cep}")
    public Response situacaoPorCep(@PathParam("cep") String cep) {
        return Response.ok(bo.buscarSituacaoPorCep(cep)).build();
    }
}
