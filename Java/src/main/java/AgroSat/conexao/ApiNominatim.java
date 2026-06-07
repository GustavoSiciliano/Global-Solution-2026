package AgroSat.conexao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;

// Converte nome de cidade em coordenadas geograficas via OpenStreetMap Nominatim
@ApplicationScoped
public class ApiNominatim {

    private static final String URL = "https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=1&countrycodes=br";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // Retorna [latitude, longitude] ou null se nao encontrar
    // Tenta 3 variacoes para aumentar a chance de sucesso
    public double[] buscarCoordenadas(String cidade, String estado) {
        // Tentativa 1: cidade + estado sem acentos
        double[] coords = buscar(semAcento(cidade) + "," + semAcento(estado));
        if (coords != null) return coords;

        // Tentativa 2: cidade sem acentos + Brasil
        coords = buscar(semAcento(cidade) + ",Brasil");
        if (coords != null) return coords;

        // Tentativa 3: cidade original com acentos + estado
        coords = buscar(cidade + "," + estado + ",Brasil");
        return coords;
    }

    private double[] buscar(String query) {
        try {
            String uri = String.format(URL, query.replace(" ", "+"));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .header("User-Agent", "AgroSat/1.0 (agrosat.gs@gmail.com)")
                    .header("Accept-Language", "pt-BR,pt;q=0.9")
                    .timeout(Duration.ofSeconds(10))
                    .GET().build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return null;

            JsonNode json = mapper.readTree(resp.body());
            if (json.isEmpty()) return null;

            double lat = json.get(0).path("lat").asDouble();
            double lon = json.get(0).path("lon").asDouble();

            // Coordenadas invalidas
            if (lat == 0 && lon == 0) return null;
            return new double[]{lat, lon};

        } catch (Exception e) {
            return null;
        }
    }

    // Remove acentos e caracteres especiais — ex: "São Paulo" → "Sao Paulo"
    private String semAcento(String texto) {
        if (texto == null) return "";
        String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFD);
        return normalizado.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
    }
}
