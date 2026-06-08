// NASA FIRMS — Fire Information for Resource Management System
// Docs: https://firms.modaps.eosdis.nasa.gov/api/
// Para uso em produção: cadastre-se em https://firms.modaps.eosdis.nasa.gov/api/
// e substitua MAP_KEY abaixo pela sua chave pessoal (gratuita).
//
// Endpoint real (quando MAP_KEY configurada):
// GET https://firms.modaps.eosdis.nasa.gov/api/country/csv/{MAP_KEY}/VIIRS_SNPP_NRT/BRA/7

export interface FocoCalor {
  lat: number;
  lon: number;
  municipio: string;
  estado: string;
  bioma: string;
  frp: number; // Fire Radiative Power (MW) — intensidade do foco
  confianca: "low" | "nominal" | "high";
  data: string;
}

export interface FirmsStats {
  total: number;
  alta_confianca: number;
  frp_medio: number;
  estados: { estado: string; count: number }[];
  biomas: { bioma: string; count: number }[];
}

// Dados simulados com base em padrões históricos reais do INPE/FIRMS para o Brasil
// Estrutura idêntica ao retorno real da API FIRMS
const MOCK_FOCOS: FocoCalor[] = [
  {
    lat: -11.82,
    lon: -52.47,
    municipio: "Querência",
    estado: "MT",
    bioma: "Amazônia",
    frp: 142.3,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -12.53,
    lon: -55.71,
    municipio: "Sorriso",
    estado: "MT",
    bioma: "Cerrado",
    frp: 89.7,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -10.94,
    lon: -51.12,
    municipio: "Luciara",
    estado: "MT",
    bioma: "Cerrado",
    frp: 67.2,
    confianca: "nominal",
    data: "2026-06-01",
  },
  {
    lat: -14.22,
    lon: -52.11,
    municipio: "Nova Xavantina",
    estado: "MT",
    bioma: "Cerrado",
    frp: 55.4,
    confianca: "nominal",
    data: "2026-06-01",
  },
  {
    lat: -3.41,
    lon: -52.12,
    municipio: "Sen. José Porfírio",
    estado: "PA",
    bioma: "Amazônia",
    frp: 198.5,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -6.12,
    lon: -55.32,
    municipio: "Itaituba",
    estado: "PA",
    bioma: "Amazônia",
    frp: 134.1,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -7.83,
    lon: -49.68,
    municipio: "Redenção",
    estado: "PA",
    bioma: "Amazônia",
    frp: 112.8,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -12.15,
    lon: -45.88,
    municipio: "Barreiras",
    estado: "BA",
    bioma: "Cerrado",
    frp: 78.3,
    confianca: "nominal",
    data: "2026-06-01",
  },
  {
    lat: -14.85,
    lon: -43.47,
    municipio: "Cocos",
    estado: "BA",
    bioma: "Cerrado",
    frp: 45.6,
    confianca: "nominal",
    data: "2026-05-31",
  },
  {
    lat: -5.47,
    lon: -44.91,
    municipio: "Barra do Corda",
    estado: "MA",
    bioma: "Cerrado",
    frp: 91.2,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -7.21,
    lon: -45.34,
    municipio: "Balsas",
    estado: "MA",
    bioma: "Cerrado",
    frp: 63.8,
    confianca: "nominal",
    data: "2026-06-01",
  },
  {
    lat: -9.84,
    lon: -48.31,
    municipio: "Pedro Afonso",
    estado: "TO",
    bioma: "Cerrado",
    frp: 87.4,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -11.42,
    lon: -49.12,
    municipio: "Pium",
    estado: "TO",
    bioma: "Cerrado",
    frp: 54.2,
    confianca: "nominal",
    data: "2026-05-31",
  },
  {
    lat: 2.83,
    lon: -60.67,
    municipio: "Boa Vista",
    estado: "RR",
    bioma: "Amazônia",
    frp: 223.7,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -17.21,
    lon: -46.87,
    municipio: "Paracatu",
    estado: "MG",
    bioma: "Cerrado",
    frp: 42.1,
    confianca: "low",
    data: "2026-06-01",
  },
  {
    lat: -16.43,
    lon: -44.53,
    municipio: "Januária",
    estado: "MG",
    bioma: "Cerrado",
    frp: 38.9,
    confianca: "nominal",
    data: "2026-05-31",
  },
  {
    lat: -14.71,
    lon: -49.32,
    municipio: "Crixás",
    estado: "GO",
    bioma: "Cerrado",
    frp: 71.5,
    confianca: "high",
    data: "2026-06-01",
  },
  {
    lat: -8.94,
    lon: -44.36,
    municipio: "Uruçuí",
    estado: "PI",
    bioma: "Cerrado",
    frp: 82.3,
    confianca: "high",
    data: "2026-06-01",
  },
];

export async function fetchFocos(): Promise<FocoCalor[]> {
  // Em produção, substituir por:
  // const MAP_KEY = 'SUA_CHAVE_AQUI'
  // const res = await fetch(
  //   `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${MAP_KEY}/VIIRS_SNPP_NRT/BRA/7`
  // )
  // const csv = await res.text()
  // return parseFirmsCsv(csv)

  // Simula latência da API real
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_FOCOS;
}

export function calcStats(focos: FocoCalor[]): FirmsStats {
  const estadoMap: Record<string, number> = {};
  const biomaMap: Record<string, number> = {};

  focos.forEach((f) => {
    estadoMap[f.estado] = (estadoMap[f.estado] || 0) + 1;
    biomaMap[f.bioma] = (biomaMap[f.bioma] || 0) + 1;
  });

  return {
    total: focos.length,
    alta_confianca: focos.filter((f) => f.confianca === "high").length,
    frp_medio: parseFloat(
      (focos.reduce((s, f) => s + f.frp, 0) / focos.length).toFixed(1),
    ),
    estados: Object.entries(estadoMap)
      .sort((a, b) => b[1] - a[1])
      .map(([estado, count]) => ({ estado, count })),
    biomas: Object.entries(biomaMap)
      .sort((a, b) => b[1] - a[1])
      .map(([bioma, count]) => ({ bioma, count })),
  };
}
