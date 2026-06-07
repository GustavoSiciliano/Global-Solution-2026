package AgroSat.conexao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

// Busca endereco completo a partir de um CEP via ViaCEP
@ApplicationScoped
public class ApiViaCep {

    private static final String URL = "https://viacep.com.br/ws/%s/json/";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // Retorna {"localidade":"Diadema","uf":"SP","bairro":"...","logradouro":"..."} ou vazio se nao encontrar
    public Map<String, String> buscarPorCep(String cep) {
        Map<String, String> resultado = new HashMap<>();
        try {
            String cepLimpo = cep.replaceAll("[^0-9]", "");
            if (cepLimpo.length() != 8) return resultado;

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(String.format(URL, cepLimpo)))
                    .timeout(Duration.ofSeconds(10))
                    .GET().build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return resultado;

            JsonNode json = mapper.readTree(resp.body());
            if (json.has("erro")) return resultado;

            resultado.put("localidade", json.path("localidade").asText(""));
            resultado.put("uf", json.path("uf").asText(""));
            resultado.put("bairro", json.path("bairro").asText(""));
            resultado.put("logradouro", json.path("logradouro").asText(""));
            resultado.put("cep", cepLimpo);

        } catch (Exception e) {
            // ViaCEP indisponivel — retorna mapa vazio
        }
        return resultado;
    }
}
