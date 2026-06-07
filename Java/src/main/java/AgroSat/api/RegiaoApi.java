package AgroSat.api;

import AgroSat.bo.RegiaoBO;
import AgroSat.vo.Regiao;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

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

    // Cadastra regiao informando apenas cidade e estado
    // Coordenadas e bioma sao buscados automaticamente
    @POST
    @Path("/buscar-por-cidade")
    public Response buscarPorCidade(Map<String, String> body) {
        return Response.status(201)
                .entity(bo.buscarPorCidade(body.get("nmCidade"), body.get("dsEstado")))
                .build();
    }

    // Retorna a regiao com ultima leitura, previsao e alertas a partir do CEP
    @GET
    @Path("/situacao/cep/{cep}")
    public Response situacaoPorCep(@PathParam("cep") String cep) {
        return Response.ok(bo.buscarSituacaoPorCep(cep)).build();
    }
}