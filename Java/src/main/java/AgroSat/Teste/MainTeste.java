package AgroSat.Teste;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Scanner;

public class MainTeste {

    static String BASE_URL = "https://global-solution-2026.onrender.com";
    static HttpClient http;
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) throws Exception {
        if (args.length > 0) BASE_URL = args[0].replaceAll("/$", "");

        http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(90))
                .build();

        cabecalho();
        health();

        boolean rodando = true;
        while (rodando) {
            menuPrincipal();
            switch (scanner.nextLine().trim()) {
                case "1" -> menuFontes();
                case "2" -> menuRegioes();
                case "3" -> menuUsuarios();
                case "4" -> menuLeituras();
                case "5" -> menuPrevisoes();
                case "6" -> menuAlertas();
                case "0" -> rodando = false;
                default  -> linha("Opcao invalida.");
            }
        }
        linha("\nAte logo!");
    }

    // ======================== MENUS ========================

    static void menuPrincipal() {
        System.out.println("\n+--------------------------------------------------+");
        System.out.printf("|  %-47s |%n", "AGROSAT  |  " + BASE_URL);
        System.out.println("+--------------------------------------------------+");
        System.out.println("|  1. Fontes Satelitais                            |");
        System.out.println("|  2. Regioes                                      |");
        System.out.println("|  3. Usuarios                                     |");
        System.out.println("|  4. Leituras Satelitais                          |");
        System.out.println("|  5. Previsoes                                    |");
        System.out.println("|  6. Alertas                                      |");
        System.out.println("|  0. Sair                                         |");
        System.out.println("+--------------------------------------------------+");
        System.out.print("\n> Escolha: ");
    }

    // Fontes sao pre-cadastradas no banco — apenas consulta
    static void menuFontes() {
        boolean loop = true;
        while (loop) {
            secao("FONTES SATELITAIS");
            System.out.println("  1. Listar todas");
            System.out.println("  2. Buscar por ID");
            System.out.println("  0. Voltar");
            System.out.print("\n> Escolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/fontes"));
                case "2" -> {
                    System.out.print("> ID: ");
                    exibir(get("/fontes/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default  -> linha("Opcao invalida.");
            }
        }
    }

    // Regioes: CRUD completo + busca automatica por CEP
    static void menuRegioes() {
        boolean loop = true;
        while (loop) {
            secao("REGIOES");
            System.out.println("  1. Listar todas");
            System.out.println("  2. Buscar por ID");
            System.out.println("  3. Listar por estado");
            System.out.println("  4. Buscar situacao por CEP  [automatico]");
            System.out.println("  5. Cadastrar");
            System.out.println("  6. Atualizar");
            System.out.println("  7. Deletar");
            System.out.println("  0. Voltar");
            System.out.print("\n> Escolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/regioes"));
                case "2" -> {
                    System.out.print("> ID: ");
                    exibir(get("/regioes/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("> Estado (ex: SP): ");
                    exibir(get("/regioes/estado/" + scanner.nextLine().trim().toUpperCase()));
                }
                case "4" -> {
                    System.out.print("> CEP (ex: 09910000): ");
                    String cep = scanner.nextLine().trim().replaceAll("[^0-9]", "");
                    aguardar("Buscando coordenadas, bioma e situacao agricola...");
                    exibir(get("/regioes/situacao/cep/" + cep));
                }
                case "5" -> {
                    System.out.print("> Cidade: ");
                    String nm  = scanner.nextLine().trim();
                    System.out.print("> Estado (sigla): ");
                    String est = scanner.nextLine().trim().toUpperCase();
                    System.out.print("> Latitude (ex: -23.5505): ");
                    String lat = scanner.nextLine().trim();
                    System.out.print("> Longitude (ex: -46.6333): ");
                    String lon = scanner.nextLine().trim();
                    System.out.print("> Bioma (ex: Mata Atlantica): ");
                    String bio = scanner.nextLine().trim();
                    exibir(post("/regioes", jsonNum(nm, est, bio, lat, lon)));
                }
                case "6" -> {
                    System.out.print("> ID: ");
                    String id  = scanner.nextLine().trim();
                    System.out.print("> Nome: ");
                    String nm  = scanner.nextLine().trim();
                    System.out.print("> Estado (sigla): ");
                    String est = scanner.nextLine().trim().toUpperCase();
                    System.out.print("> Latitude: ");
                    String lat = scanner.nextLine().trim();
                    System.out.print("> Longitude: ");
                    String lon = scanner.nextLine().trim();
                    System.out.print("> Bioma: ");
                    String bio = scanner.nextLine().trim();
                    exibir(put("/regioes/" + id, jsonNum(nm, est, bio, lat, lon)));
                }
                case "7" -> {
                    System.out.print("> ID: ");
                    exibir(delete("/regioes/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default  -> linha("Opcao invalida.");
            }
        }
    }

    // Usuarios: CRUD completo
    static void menuUsuarios() {
        boolean loop = true;
        while (loop) {
            secao("USUARIOS");
            System.out.println("  1. Listar todos");
            System.out.println("  2. Buscar por ID");
            System.out.println("  3. Cadastrar");
            System.out.println("  4. Atualizar");
            System.out.println("  5. Deletar");
            System.out.println("  0. Voltar");
            System.out.print("\n> Escolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/usuarios"));
                case "2" -> {
                    System.out.print("> ID: ");
                    exibir(get("/usuarios/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("> Nome: ");
                    String nm    = scanner.nextLine().trim();
                    System.out.print("> Email: ");
                    String email = scanner.nextLine().trim();
                    System.out.print("> Senha: ");
                    String senha = scanner.nextLine().trim();
                    System.out.print("> Perfil (ADMIN / PRODUTOR / GESTOR): ");
                    String perf  = scanner.nextLine().trim().toUpperCase();
                    exibir(post("/usuarios", json(
                            "nmUsuario", nm, "dsEmail", email, "dsSenha", senha, "dsPerfil", perf)));
                }
                case "4" -> {
                    System.out.print("> ID: ");
                    String id    = scanner.nextLine().trim();
                    System.out.print("> Nome: ");
                    String nm    = scanner.nextLine().trim();
                    System.out.print("> Email: ");
                    String email = scanner.nextLine().trim();
                    System.out.print("> Perfil: ");
                    String perf  = scanner.nextLine().trim().toUpperCase();
                    exibir(put("/usuarios/" + id, json(
                            "nmUsuario", nm, "dsEmail", email, "dsPerfil", perf)));
                }
                case "5" -> {
                    System.out.print("> ID: ");
                    exibir(delete("/usuarios/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default  -> linha("Opcao invalida.");
            }
        }
    }

    // Leituras: usuario informa a regiao, APIs coletam tudo automaticamente
    static void menuLeituras() {
        boolean loop = true;
        while (loop) {
            secao("LEITURAS SATELITAIS");
            System.out.println("  1. Listar todas");
            System.out.println("  2. Buscar por ID");
            System.out.println("  3. Listar por regiao");
            System.out.println("  4. Registrar  [NASA + Open-Meteo + IA automatico]");
            System.out.println("  5. Deletar");
            System.out.println("  0. Voltar");
            System.out.print("\n> Escolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/leituras"));
                case "2" -> {
                    System.out.print("> ID: ");
                    exibir(get("/leituras/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("> ID da regiao: ");
                    exibir(get("/leituras/regiao/" + scanner.nextLine().trim()));
                }
                case "4" -> {
                    System.out.print("> ID da regiao: ");
                    String id = scanner.nextLine().trim();
                    aguardar("Coletando dados satelitais e consultando IA (ate 60s)...");
                    exibir(post("/leituras/automatico/" + id, ""));
                }
                case "5" -> {
                    System.out.print("> ID: ");
                    exibir(delete("/leituras/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default  -> linha("Opcao invalida.");
            }
        }
    }

    // Previsoes sao geradas automaticamente — apenas consulta
    static void menuPrevisoes() {
        boolean loop = true;
        while (loop) {
            secao("PREVISOES");
            System.out.println("  1. Listar todas");
            System.out.println("  2. Buscar por ID");
            System.out.println("  3. Listar por regiao");
            System.out.println("  0. Voltar");
            System.out.print("\n> Escolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/previsoes"));
                case "2" -> {
                    System.out.print("> ID: ");
                    exibir(get("/previsoes/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("> ID da regiao: ");
                    exibir(get("/previsoes/regiao/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default  -> linha("Opcao invalida.");
            }
        }
    }

    // Alertas sao gerados automaticamente quando risco >= 40%
    static void menuAlertas() {
        boolean loop = true;
        while (loop) {
            secao("ALERTAS");
            System.out.println("  1. Listar todos");
            System.out.println("  2. Listar pendentes");
            System.out.println("  3. Listar por regiao");
            System.out.println("  4. Buscar por ID");
            System.out.println("  5. Ver historico");
            System.out.println("  6. Resolver alerta");
            System.out.println("  0. Voltar");
            System.out.print("\n> Escolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/alertas"));
                case "2" -> exibir(get("/alertas/pendentes"));
                case "3" -> {
                    System.out.print("> ID da regiao: ");
                    exibir(get("/alertas/regiao/" + scanner.nextLine().trim()));
                }
                case "4" -> {
                    System.out.print("> ID: ");
                    exibir(get("/alertas/" + scanner.nextLine().trim()));
                }
                case "5" -> {
                    System.out.print("> ID do alerta: ");
                    exibir(get("/alertas/" + scanner.nextLine().trim() + "/historico"));
                }
                case "6" -> {
                    System.out.print("> ID do alerta: ");
                    String idA = scanner.nextLine().trim();
                    System.out.print("> ID do usuario (Enter para omitir): ");
                    String idU = scanner.nextLine().trim();
                    String endpoint = "/alertas/" + idA + "/resolver";
                    if (!idU.isEmpty()) endpoint += "?idUsuario=" + idU;
                    exibir(put(endpoint, ""));
                }
                case "0" -> loop = false;
                default  -> linha("Opcao invalida.");
            }
        }
    }

    // ======================== UTILITARIOS ========================

    static void cabecalho() {
        System.out.println("\n+--------------------------------------------------+");
        System.out.println("|                                                  |");
        System.out.println("|   AGROSAT  --  Monitoramento Agricola            |");
        System.out.println("|   Satelite + IA + Oracle FIAP                    |");
        System.out.println("|                                                  |");
        System.out.println("+--------------------------------------------------+");
    }

    static void health() {
        System.out.print("\nConectando em " + BASE_URL + " ... ");
        String resp = get("/health");
        if (resp.contains("\"ok\"")) {
            System.out.println("online");
            if (resp.contains("conectado")) System.out.println("Oracle: conectado");
        } else {
            System.out.println("aguardando (Render pode estar hibernando, tente novamente)");
        }
    }

    static void secao(String titulo) {
        System.out.println("\n--- " + titulo + " ---");
    }

    static void aguardar(String msg) {
        System.out.println("  >> " + msg);
    }

    static void linha(String s) {
        System.out.println(s);
    }

    static void exibir(String resposta) {
        if (resposta == null || resposta.isBlank() || resposta.trim().equals("[]")) {
            System.out.println("\n  Nenhum registro encontrado.");
            return;
        }
        if (resposta.trim().equals("(removido com sucesso)")) {
            System.out.println("\n  Registro removido com sucesso.");
            return;
        }
        System.out.println("\n" + formatar(resposta));
    }

    static String formatar(String json) {
        if (json == null || json.isBlank()) return "  (sem conteudo)";
        StringBuilder sb = new StringBuilder();
        int indent = 0;
        boolean str = false;
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"' && (i == 0 || json.charAt(i - 1) != '\\')) str = !str;
            if (!str) {
                if (c == '{' || c == '[') { sb.append(c).append("\n").append("  ".repeat(++indent)); continue; }
                if (c == '}' || c == ']') { sb.append("\n").append("  ".repeat(--indent)).append(c); continue; }
                if (c == ',') { sb.append(c).append("\n").append("  ".repeat(indent)); continue; }
                if (c == ':') { sb.append(": "); continue; }
            }
            sb.append(c);
        }
        return sb.toString();
    }

    static String json(String... pares) {
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < pares.length; i += 2) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(pares[i]).append("\":\"").append(pares[i + 1]).append("\"");
        }
        return sb.append("}").toString();
    }

    static String jsonNum(String nm, String est, String bio, String lat, String lon) {
        return "{\"nmRegiao\":\"" + nm + "\",\"dsEstado\":\"" + est + "\",\"dsBioma\":\"" + bio +
                "\",\"nrLatitude\":" + lat + ",\"nrLongitude\":" + lon + "}";
    }

    // ======================== HTTP ========================

    static String get(String caminho) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + caminho))
                    .timeout(Duration.ofSeconds(90))
                    .GET().build();
            return http.send(req, HttpResponse.BodyHandlers.ofString()).body();
        } catch (Exception e) {
            return "{\"erro\":\"" + e.getMessage() + "\"}";
        }
    }

    static String post(String caminho, String corpo) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + caminho))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(90))
                    .POST(HttpRequest.BodyPublishers.ofString(corpo)).build();
            return http.send(req, HttpResponse.BodyHandlers.ofString()).body();
        } catch (Exception e) {
            return "{\"erro\":\"" + e.getMessage() + "\"}";
        }
    }

    static String put(String caminho, String corpo) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + caminho))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(90))
                    .PUT(HttpRequest.BodyPublishers.ofString(corpo)).build();
            return http.send(req, HttpResponse.BodyHandlers.ofString()).body();
        } catch (Exception e) {
            return "{\"erro\":\"" + e.getMessage() + "\"}";
        }
    }

    static String delete(String caminho) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + caminho))
                    .timeout(Duration.ofSeconds(30))
                    .DELETE().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            return resp.statusCode() == 204 ? "(removido com sucesso)" : resp.body();
        } catch (Exception e) {
            return "{\"erro\":\"" + e.getMessage() + "\"}";
        }
    }
}
