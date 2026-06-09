// Open-Meteo API — gratuita, sem autenticação
// Docs: https://open-meteo.com/en/docs

export interface OpenMeteoData {
  regiao_id: number;
  nm_regiao: string;
  temperatura: number; // °C atual
  precipitacao: number; // mm últimas 24h
  umidade: number; // %
  velocidade_vento: number; // km/h
  radiacao_solar: number; // W/m²
  chuva_7dias: number; // mm acumulado 7 dias
  dt_consulta: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    shortwave_radiation: number;
  };
  daily: {
    precipitation_sum: number[];
  };
}

// Busca clima atual + precipitação 7 dias para uma região
export async function fetchClima(
  id: number,
  nome: string,
  lat: number,
  lon: number,
): Promise<OpenMeteoData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,shortwave_radiation",
  );
  url.searchParams.set("daily", "precipitation_sum");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "America/Sao_Paulo");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data: OpenMeteoResponse = await res.json();

  const c = data.current;
  const chuva7 = data.daily.precipitation_sum.reduce((s, v) => s + (v ?? 0), 0);

  return {
    regiao_id: id,
    nm_regiao: nome,
    temperatura: Math.round(c.temperature_2m * 10) / 10,
    precipitacao: Math.round(c.precipitation * 10) / 10,
    umidade: c.relative_humidity_2m,
    velocidade_vento: Math.round(c.wind_speed_10m),
    radiacao_solar: Math.round(c.shortwave_radiation),
    chuva_7dias: Math.round(chuva7 * 10) / 10,
    dt_consulta: new Date().toLocaleString("pt-BR"),
  };
}

// Busca clima para todas as regiões em paralelo
export async function fetchClimaTodasRegioes(
  regioes: {
    id_regiao: number;
    nm_regiao: string;
    nr_latitude: number;
    nr_longitude: number;
  }[],
): Promise<OpenMeteoData[]> {
  const results = await Promise.allSettled(
    regioes.map((r) =>
      fetchClima(r.id_regiao, r.nm_regiao, r.nr_latitude, r.nr_longitude),
    ),
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<OpenMeteoData> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);
}
