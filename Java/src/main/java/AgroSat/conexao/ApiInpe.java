package AgroSat.conexao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

// Identifica o bioma de uma coordenada via INPE TerraBrasilis
@ApplicationScoped
public class ApiInpe {

    private static final String URL = "https://terrabrasilis.dpi.inpe.br/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=terrabrasilis:brasil_biomas&outputFormat=application/json&bbox=%s&count=1";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // Retorna o nome do bioma ou null se nao encontrar
    public String buscarBioma(double latitude, double longitude) {
        try {
            double raio = 0.1;
            String bbox = String.format("%.6f,%.6f,%.6f,%.6f",
                    longitude - raio, latitude - raio,
                    longitude + raio, latitude + raio);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(String.format(URL, bbox)))
                    .timeout(Duration.ofSeconds(10))
                    .GET().build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return null;

            JsonNode json = mapper.readTree(resp.body());
            JsonNode features = json.path("features");
            if (features.isEmpty()) return null;

            JsonNode props = features.get(0).path("properties");
            String bioma = props.path("bioma").asText("");
            if (bioma.isBlank()) bioma = props.path("nome").asText("");
            return bioma.isBlank() ? null : bioma;

        } catch (Exception e) {
            return null;
        }
    }
}
