package AgroSat.conexao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

// Converte nome de cidade em coordenadas geograficas via OpenStreetMap Nominatim
@ApplicationScoped
public class ApiNominatim {

    private static final String URL = "https://nominatim.openstreetmap.org/search?q=%s,%s,Brasil&format=json&limit=1";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // Retorna [latitude, longitude] ou null se nao encontrar
    public double[] buscarCoordenadas(String cidade, String estado) {
        try {
            String query = String.format(URL,
                    cidade.replace(" ", "+"),
                    estado.replace(" ", "+"));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(query))
                    .header("User-Agent", "AgroSat/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .GET().build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return null;

            JsonNode json = mapper.readTree(resp.body());
            if (json.isEmpty()) return null;

            double lat = json.get(0).path("lat").asDouble();
            double lon = json.get(0).path("lon").asDouble();
            return new double[]{lat, lon};

        } catch (Exception e) {
            return null;
        }
    }
}
