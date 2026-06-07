package AgroSat.Teste;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Scanner;

public class MainTeste {

    static String BASE_URL = "https://agrosat-java.onrender.com";
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
            menu();
            switch (scanner.nextLine().trim()) {
                case "1" -> menuFontes();
                case "2" -> menuRegioes();
                case "3" -> menuUsuarios();
                case "4" -> menuLeituras();
                case "5" -> menuPrevisoes();
                case "6" -> menuAlertas();
                case "0" -> rodando = false;
                default -> System.out.println("Opcao invalida.");
            }
        }
        System.out.println("\nSistema encerrado.");
    }

    // ======================== MENUS ========================

    static void menu() {
        print("\n" + "=".repeat(50));
        print("  AGROSAT — MENU PRINCIPAL | " + BASE_URL);
        print("=".repeat(50));
        print("  1. Fontes Satelitais");
        print("  2. Regioes");
        print("  3. Usuarios");
        print("  4. Leituras Satelitais");
        print("  5. Previsoes");
        print("  6. Alertas");
        print("  0. Sair");
        System.out.print("\nEscolha: ");
    }

    static void menuFontes() {
        boolean loop = true;
        while (loop) {
            print("\n--- FONTES SATELITAIS ---");
            print("  1. Listar todas");
            print("  2. Buscar por ID");
            print("  3. Cadastrar");
            print("  4. Atualizar");
            print("  5. Deletar");
            print("  0. Voltar");
            System.out.print("\nEscolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/fontes"));
                case "2" -> {
                    System.out.print("ID: ");
                    exibir(get("/fontes/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("Nome: ");
                    String nm = scanner.nextLine().trim();
                    System.out.print("URL: ");
                    String url = scanner.nextLine().trim();
                    System.out.print("Tipo de dado (ex: NDVI): ");
                    String tipo = scanner.nextLine().trim();
                    System.out.print("Descricao: ");
                    String desc = scanner.nextLine().trim();
                    exibir(post("/fontes", json(
                            "nmFonte", nm, "dsUrl", url, "dsTipoDado", tipo, "dsDescricao", desc)));
                }
                case "4" -> {
                    System.out.print("ID: ");
                    String id = scanner.nextLine().trim();
                    System.out.print("Nome: ");
                    String nm = scanner.nextLine().trim();
                    System.out.print("URL: ");
                    String url = scanner.nextLine().trim();
                    System.out.print("Tipo: ");
                    String tipo = scanner.nextLine().trim();
                    System.out.print("Descricao: ");
                    String desc = scanner.nextLine().trim();
                    exibir(put("/fontes/" + id, json(
                            "nmFonte", nm, "dsUrl", url, "dsTipoDado", tipo, "dsDescricao", desc)));
                }
                case "5" -> {
                    System.out.print("ID: ");
                    exibir(delete("/fontes/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default -> print("Opcao invalida.");
            }
        }
    }

    static void menuRegioes() {
        boolean loop = true;
        while (loop) {
            print("\n--- REGIOES ---");
            print("  1. Listar todas");
            print("  2. Buscar por ID");
            print("  3. Listar por estado");
            print("  4. Buscar situacao por CEP (automatico)");
            print("  5. Cadastrar");
            print("  6. Atualizar");
            print("  7. Deletar");
            print("  0. Voltar");
            System.out.print("\nEscolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/regioes"));
                case "2" -> {
                    System.out.print("ID: ");
                    exibir(get("/regioes/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("Sigla (ex: MT): ");
                    exibir(get("/regioes/estado/" + scanner.nextLine().trim().toUpperCase()));
                }
                case "4" -> {
                    System.out.print("CEP (ex: 09910-000): ");
                    String cep = scanner.nextLine().trim().replaceAll("[^0-9]", "");
                    print("Buscando coordenadas, bioma e situacao agricola...");
                    exibir(get("/regioes/situacao/cep/" + cep));
                }
                case "5" -> {
                    System.out.print("Cidade: ");
                    String nm = scanner.nextLine().trim();
                    System.out.print("Estado (sigla): ");
                    String est = scanner.nextLine().trim().toUpperCase();
                    System.out.print("Latitude (ex: -12.5442): ");
                    String lat = scanner.nextLine().trim();
                    System.out.print("Longitude (ex: -55.7214): ");
                    String lon = scanner.nextLine().trim();
                    System.out.print("Bioma: ");
                    String bio = scanner.nextLine().trim();
                    exibir(post("/regioes", jsonNum(
                            "nmRegiao", nm, "dsEstado", est, "dsBioma", bio,
                            "nrLatitude", lat, "nrLongitude", lon)));
                }
                case "6" -> {
                    System.out.print("ID: ");
                    String id = scanner.nextLine().trim();
                    System.out.print("Nome: ");
                    String nm = scanner.nextLine().trim();
                    System.out.print("Estado: ");
                    String est = scanner.nextLine().trim().toUpperCase();
                    System.out.print("Latitude: ");
                    String lat = scanner.nextLine().trim();
                    System.out.print("Longitude: ");
                    String lon = scanner.nextLine().trim();
                    System.out.print("Bioma: ");
                    String bio = scanner.nextLine().trim();
                    exibir(put("/regioes/" + id, jsonNum(
                            "nmRegiao", nm, "dsEstado", est, "dsBioma", bio,
                            "nrLatitude", lat, "nrLongitude", lon)));
                }
                case "7" -> {
                    System.out.print("ID: ");
                    exibir(delete("/regioes/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default -> print("Opcao invalida.");
            }
        }
    }

    static void menuUsuarios() {
        boolean loop = true;
        while (loop) {
            print("\n--- USUARIOS ---");
            print("  1. Listar todos");
            print("  2. Buscar por ID");
            print("  3. Cadastrar");
            print("  4. Atualizar");
            print("  5. Deletar");
            print("  0. Voltar");
            System.out.print("\nEscolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/usuarios"));
                case "2" -> {
                    System.out.print("ID: ");
                    exibir(get("/usuarios/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("Nome: ");
                    String nm = scanner.nextLine().trim();
                    System.out.print("Email: ");
                    String email = scanner.nextLine().trim();
                    System.out.print("Senha (min. 6): ");
                    String senha = scanner.nextLine().trim();
                    System.out.print("Perfil (ADMIN/PRODUTOR/GESTOR): ");
                    String perfil = scanner.nextLine().trim().toUpperCase();
                    exibir(post("/usuarios", json("nmUsuario", nm, "dsEmail", email, "dsSenha", senha, "dsPerfil", perfil)));
                }
                case "4" -> {
                    System.out.print("ID: ");
                    String id = scanner.nextLine().trim();
                    System.out.print("Nome: ");
                    String nm = scanner.nextLine().trim();
                    System.out.print("Email: ");
                    String email = scanner.nextLine().trim();
                    System.out.print("Perfil: ");
                    String perfil = scanner.nextLine().trim().toUpperCase();
                    exibir(put("/usuarios/" + id, json("nmUsuario", nm, "dsEmail", email, "dsPerfil", perfil)));
                }
                case "5" -> {
                    System.out.print("ID: ");
                    exibir(delete("/usuarios/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default -> print("Opcao invalida.");
            }
        }
    }

    static void menuLeituras() {
        boolean loop = true;
        while (loop) {
            print("\n--- LEITURAS SATELITAIS ---");
            print("  1. Listar todas");
            print("  2. Buscar por ID");
            print("  3. Listar por regiao");
            print("  4. Registrar automatico (NASA + Open-Meteo + IA)");
            print("  5. Registrar manual (com IA automatica)");
            print("  6. Deletar");
            print("  0. Voltar");
            System.out.print("\nEscolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/leituras"));
                case "2" -> {
                    System.out.print("ID: ");
                    exibir(get("/leituras/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("ID da regiao: ");
                    exibir(get("/leituras/regiao/" + scanner.nextLine().trim()));
                }
                case "4" -> {
                    System.out.print("ID da regiao: ");
                    String id = scanner.nextLine().trim();
                    print("Coletando dados das APIs espaciais e consultando IA (aguarde ate 60s)...");
                    exibir(post("/leituras/automatico/" + id, ""));
                }
                case "5" -> {
                    System.out.print("ID da regiao: ");
                    String idReg = scanner.nextLine().trim();
                    System.out.print("NDVI (-1 a 1): ");
                    String ndvi = scanner.nextLine().trim();
                    System.out.print("Temperatura (C): ");
                    String temp = scanner.nextLine().trim();
                    System.out.print("Precipitacao (mm) [Enter=0]: ");
                    String prec = lerOuPadrao("0");
                    System.out.print("Umidade (%) [Enter=50]: ");
                    String umid = lerOuPadrao("50");
                    System.out.print("Dias sem chuva [Enter=0]: ");
                    String dias = lerOuPadrao("0");
                    System.out.print("Radiacao solar kWh/m2 [Enter=20]: ");
                    String rad = lerOuPadrao("20");
                    print("Salvando e consultando IA (aguarde ate 60s)...");
                    exibir(post("/leituras",
                            "{\"idRegiao\":" + idReg + ",\"nrNdvi\":" + ndvi + ",\"nrTemperatura\":" + temp +
                                    ",\"nrPrecipitacao\":" + prec + ",\"nrUmidade\":" + umid +
                                    ",\"nrDiasSemChuva\":" + dias + ",\"nrRadiacaoSolar\":" + rad + "}"));
                }
                case "6" -> {
                    System.out.print("ID: ");
                    exibir(delete("/leituras/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default -> print("Opcao invalida.");
            }
        }
    }

    static void menuPrevisoes() {
        boolean loop = true;
        while (loop) {
            print("\n--- PREVISOES ---");
            print("  1. Listar todas");
            print("  2. Buscar por ID");
            print("  3. Listar por regiao");
            print("  4. Cadastrar manualmente");
            print("  0. Voltar");
            System.out.print("\nEscolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/previsoes"));
                case "2" -> {
                    System.out.print("ID: ");
                    exibir(get("/previsoes/" + scanner.nextLine().trim()));
                }
                case "3" -> {
                    System.out.print("ID da regiao: ");
                    exibir(get("/previsoes/regiao/" + scanner.nextLine().trim()));
                }
                case "4" -> {
                    System.out.print("ID da leitura: ");
                    String idL = scanner.nextLine().trim();
                    System.out.print("Status (SAUDAVEL/EM_ESTRESSE/CRITICO): ");
                    String st = scanner.nextLine().trim().toUpperCase();
                    System.out.print("Risco hidrico (0-100): ");
                    String risco = scanner.nextLine().trim();
                    System.out.print("Modelo [Enter=RandomForest_v1]: ");
                    String modelo = scanner.nextLine().trim();
                    if (modelo.isEmpty()) modelo = "RandomForest_v1";
                    exibir(post("/previsoes",
                            "{\"idLeitura\":" + idL + ",\"dsStatusVegetacao\":\"" + st +
                                    "\",\"nrRiscoHidrico\":" + risco + ",\"dsModeloUsado\":\"" + modelo + "\"}"));
                }
                case "0" -> loop = false;
                default -> print("Opcao invalida.");
            }
        }
    }

    static void menuAlertas() {
        boolean loop = true;
        while (loop) {
            print("\n--- ALERTAS ---");
            print("  1. Listar todos");
            print("  2. Listar pendentes");
            print("  3. Listar por regiao");
            print("  4. Buscar por ID");
            print("  5. Ver historico");
            print("  6. Resolver alerta");
            print("  7. Registrar acao no historico");
            print("  8. Deletar");
            print("  0. Voltar");
            System.out.print("\nEscolha: ");
            switch (scanner.nextLine().trim()) {
                case "1" -> exibir(get("/alertas"));
                case "2" -> exibir(get("/alertas/pendentes"));
                case "3" -> {
                    System.out.print("ID da regiao: ");
                    exibir(get("/alertas/regiao/" + scanner.nextLine().trim()));
                }
                case "4" -> {
                    System.out.print("ID: ");
                    exibir(get("/alertas/" + scanner.nextLine().trim()));
                }
                case "5" -> {
                    System.out.print("ID do alerta: ");
                    exibir(get("/alertas/" + scanner.nextLine().trim() + "/historico"));
                }
                case "6" -> {
                    System.out.print("ID do alerta: ");
                    String idA = scanner.nextLine().trim();
                    System.out.print("ID do usuario (Enter para omitir): ");
                    String idU = scanner.nextLine().trim();
                    String endpoint = "/alertas/" + idA + "/resolver";
                    if (!idU.isEmpty()) endpoint += "?idUsuario=" + idU;
                    exibir(put(endpoint, ""));
                }
                case "7" -> {
                    System.out.print("ID do alerta: ");
                    String idA = scanner.nextLine().trim();
                    System.out.print("ID do usuario: ");
                    String idU = scanner.nextLine().trim();
                    System.out.print("Acao (VISUALIZADO/RECONHECIDO/RESOLVIDO/IGNORADO): ");
                    String acao = scanner.nextLine().trim().toUpperCase();
                    System.out.print("Observacao (Enter para omitir): ");
                    String obs = scanner.nextLine().trim();
                    exibir(post("/alertas/historico",
                            "{\"idAlerta\":" + idA + ",\"idUsuario\":" + idU +
                                    ",\"dsAcao\":\"" + acao + "\",\"dsObservacao\":\"" + obs + "\"}"));
                }
                case "8" -> {
                    System.out.print("ID: ");
                    exibir(delete("/alertas/" + scanner.nextLine().trim()));
                }
                case "0" -> loop = false;
                default -> print("Opcao invalida.");
            }
        }
    }

    // ======================== UTILITARIOS ========================

    static void cabecalho() {
        print("=".repeat(50));
        print("  AGROSAT - API JAVA");
        print("  URL: " + BASE_URL);
        print("=".repeat(50));
    }

    static void health() {
        print("\nVerificando API...");
        String resp = get("/health");
        print(resp.contains("\"ok\"") ? "API online." : "AVISO: API pode estar hibernando no Render (aguarde 30-60s).");
        if (resp.contains("conectado")) print("Oracle conectado.");
    }

    static void exibir(String resposta) {
        print("\n" + formatar(resposta));
    }

    static String lerOuPadrao(String padrao) {
        String v = scanner.nextLine().trim();
        return v.isEmpty() ? padrao : v;
    }

    static void print(String s) {
        System.out.println(s);
    }

    // Formata JSON com indentacao basica
    static String formatar(String json) {
        if (json == null || json.isBlank()) return "(sem conteudo)";
        StringBuilder sb = new StringBuilder();
        int indent = 0;
        boolean str = false;
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"' && (i == 0 || json.charAt(i - 1) != '\\')) str = !str;
            if (!str) {
                if (c == '{' || c == '[') {
                    sb.append(c).append("\n").append("  ".repeat(++indent));
                    continue;
                }
                if (c == '}' || c == ']') {
                    sb.append("\n").append("  ".repeat(--indent)).append(c);
                    continue;
                }
                if (c == ',') {
                    sb.append(c).append("\n").append("  ".repeat(indent));
                    continue;
                }
                if (c == ':') {
                    sb.append(": ");
                    continue;
                }
            }
            sb.append(c);
        }
        return sb.toString();
    }

    // Monta JSON com valores string
    static String json(String... pares) {
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < pares.length; i += 2) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(pares[i]).append("\":\"").append(pares[i + 1]).append("\"");
        }
        return sb.append("}").toString();
    }

    // Monta JSON com string e numeros misturados (strings=texto, numeros=lat/lon)
    static String jsonNum(String nm, String nmV, String est, String estV, String bio, String bioV, String lat, String latV, String lon, String lonV) {
        return "{\"nmRegiao\":\"" + nmV + "\",\"dsEstado\":\"" + estV + "\",\"dsBioma\":\"" + bioV +
                "\",\"nrLatitude\":" + latV + ",\"nrLongitude\":" + lonV + "}";
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
