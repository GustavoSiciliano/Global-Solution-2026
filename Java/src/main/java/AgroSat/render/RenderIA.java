package AgroSat.render;

import AgroSat.vo.LeituraSatelital;
import AgroSat.vo.ResultadoIA;
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

// Chama o Flask IA no Render para classificar vegetacao e prever risco hidrico
@ApplicationScoped
public class RenderIA {

    private static final String URL = "https://gs-ia.onrender.com/predict/completo";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(70))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public ResultadoIA prever(LeituraSatelital leitura) {
        ResultadoIA resultado = new ResultadoIA();
        resultado.setSucesso(false);
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("ndvi", leitura.getNrNdvi());
            payload.put("temperatura", leitura.getNrTemperatura());
            payload.put("precipitacao", leitura.getNrPrecipitacao() != null ? leitura.getNrPrecipitacao() : 0.0);
            payload.put("umidade", leitura.getNrUmidade() != null ? leitura.getNrUmidade() : 50.0);
            payload.put("dias_sem_chuva", leitura.getNrDiasSemChuva() != null ? leitura.getNrDiasSemChuva() : 0);
            payload.put("radiacao_solar", leitura.getNrRadiacaoSolar() != null ? leitura.getNrRadiacaoSolar() : 20.0);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(URL))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(65))
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return resultado;

            JsonNode json = mapper.readTree(resp.body());
            resultado.setSucesso(true);
            resultado.setStatusVegetacao(json.path("status_vegetacao").asText("N/A"));
            resultado.setRiscoHidrico(json.path("risco_hidrico").asDouble(0.0));
            resultado.setNivelAlerta(json.path("nivel_alerta").asText("BAIXO"));
            resultado.setConfianca(json.path("confianca").asDouble(0.0));

        } catch (Exception e) {
            // Render indisponivel — retorna resultado sem sucesso
        }
        return resultado;
    }
}
