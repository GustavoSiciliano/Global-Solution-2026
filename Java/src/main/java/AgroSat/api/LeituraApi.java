package AgroSat.api;

import AgroSat.bo.LeituraBO;
import AgroSat.vo.LeituraSatelital;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

// Endpoints de leituras — POST automatico coleta dados das APIs espaciais e chama IA
@Path("/leituras")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LeituraApi {

    @Inject
    LeituraBO bo;

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

    // Coleta NASA POWER + Open-Meteo + NDVI automaticamente para a regiao
    @POST
    @Path("/automatico/{idRegiao}")
    public Response inserirAutomatico(@PathParam("idRegiao") Long idRegiao) {
        return Response.status(201).entity(bo.inserirAutomatico(idRegiao)).build();
    }

    // Insere leitura com dados informados manualmente
    @POST
    public Response inserir(LeituraSatelital l) {
        return Response.status(201).entity(bo.inserir(l)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        bo.deletar(id);
        return Response.noContent().build();
    }
}
