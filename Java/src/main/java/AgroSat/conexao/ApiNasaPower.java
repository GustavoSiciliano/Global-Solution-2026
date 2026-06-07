package AgroSat.conexao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

// Coleta temperatura media e radiacao solar via NASA POWER (media 7 dias)
@ApplicationScoped
public class ApiNasaPower {

    private static final String URL =
            "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=%s&latitude=%s&start=%s&end=%s&format=JSON";

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // Retorna [temperatura_media, radiacao_media] ou null se indisponivel
    public double[] buscarDadosClimaticos(double latitude, double longitude) {
        try {
            String fim = LocalDate.now().format(FMT);
            String inicio = LocalDate.now().minusDays(7).format(FMT);

            String uri = String.format(URL, longitude, latitude, inicio, fim);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .timeout(Duration.ofSeconds(15))
                    .GET().build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return null;

            JsonNode params = mapper.readTree(resp.body())
                    .path("properties").path("parameter");

            double temperatura = calcularMedia(params.path("T2M"));
            double radiacao = calcularMedia(params.path("ALLSKY_SFC_SW_DWN"));

            if (temperatura == 0 && radiacao == 0) return null;
            return new double[]{temperatura, radiacao};

        } catch (Exception e) {
            return null;
        }
    }

    private double calcularMedia(JsonNode node) {
        List<Double> valores = new ArrayList<>();
        node.fields().forEachRemaining(entry -> {
            double v = entry.getValue().asDouble();
            if (v > -900) valores.add(v);
        });
        if (valores.isEmpty()) return 0;
        return valores.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }
}
