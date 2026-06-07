package AgroSat.conexao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

// Coleta precipitacao, umidade e dias sem chuva via Open-Meteo (30 dias)
@ApplicationScoped
public class ApiOpenMeteo {

    private static final String URL =
            "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&daily=precipitation_sum,relative_humidity_2m_max&timezone=America/Sao_Paulo&past_days=30&forecast_days=1";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // Retorna [precipitacao_media, umidade_media, dias_sem_chuva] ou null se indisponivel
    public double[] buscarDadosPrecipitacao(double latitude, double longitude) {
        try {
            String uri = String.format(URL, latitude, longitude);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .timeout(Duration.ofSeconds(15))
                    .GET().build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return null;

            JsonNode daily = mapper.readTree(resp.body()).path("daily");

            List<Double> precipLista = extrairValores(daily.path("precipitation_sum"));
            List<Double> umidLista = extrairValores(daily.path("relative_humidity_2m_max"));

            if (precipLista.isEmpty()) return null;

            double precip = precipLista.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double umid = umidLista.isEmpty() ? 50.0
                    : umidLista.stream().mapToDouble(Double::doubleValue).average().orElse(50);

            int diasSemChuva = 0;
            for (int i = precipLista.size() - 1; i >= 0; i--) {
                if (precipLista.get(i) < 0.1) diasSemChuva++;
                else break;
            }

            return new double[]{precip, umid, diasSemChuva};

        } catch (Exception e) {
            return null;
        }
    }

    private List<Double> extrairValores(JsonNode node) {
        List<Double> lista = new ArrayList<>();
        node.forEach(v -> {
            if (!v.isNull()) lista.add(v.asDouble());
        });
        return lista;
    }
}
