import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import random
from datetime import datetime, timedelta
from config.settings import NASA_POWER_URL, NASA_FIRMS_URL, NASA_FIRMS_KEY, OPEN_METEO_URL, INPE_URL

NDVI_POR_BIOMA = {
    'Cerrado': (0.35, 0.70),
    'Amazonia': (0.65, 0.90),
    'Mata Atlantica': (0.55, 0.80),
    'Pampa': (0.45, 0.75),
    'default': (0.20, 0.85)
}

def _coletar_nasa_power(latitude, longitude, dias=7):
    
    # NASA POWER: temperatura média e radiação solar
    try:
        fim = datetime.now()
        inicio = fim - timedelta(days=dias)
        params = {
            'parameters': 'T2M,ALLSKY_SFC_SW_DWN',
            'community': 'AG',
            'longitude': longitude,
            'latitude': latitude,
            'start': inicio.strftime('%Y%m%d'),
            'end': fim.strftime('%Y%m%d'),
            'format': 'JSON'
        }
        
        resp = requests.get(NASA_POWER_URL, params=params, timeout=15)
        resp.raise_for_status()
        props = resp.json().get('properties', {}).get('parameter', {})
        temps = [v for v in props.get('T2M', {}).values() if v and v > -900]
        rads = [v for v in props.get('ALLSKY_SFC_SW_DWN', {}).values() if v and v > -900]
        
        return {
            'temperatura': round(sum(temps) / len(temps), 2) if temps else None,
            'radiacao_solar': round(sum(rads) / len(rads), 2) if rads else None
        }
    except Exception:
        return {'temperatura': None, 'radiacao_solar': None}

def _coletar_nasa_firms(latitude, longitude):
    
    # NASA FIRMS: contagem de focos de calor na área
    try:
        area = f"{longitude-0.5},{latitude-0.5},{longitude+0.5},{latitude+0.5}"
        url = f"{NASA_FIRMS_URL}/{NASA_FIRMS_KEY}/VIIRS_SNPP_NRT/{area}/1"
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        linhas = resp.text.strip().split('\n')
        return {'focos_calor': max(0, len(linhas) - 1)}
    except Exception:
        return {'focos_calor': 0}


def _coletar_open_meteo(latitude, longitude):
    
    # Open-Meteo: precipitação, umidade e dias consecutivos sem chuva
    try:
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'daily': 'precipitation_sum,relative_humidity_2m_max',
            'timezone': 'America/Sao_Paulo',
            'past_days': 30,
            'forecast_days': 1
        }
        
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=15)
        resp.raise_for_status()
        daily = resp.json().get('daily', {})
        precipitacao = [p for p in daily.get('precipitation_sum', []) if p is not None]
        umidade_list = [u for u in daily.get('relative_humidity_2m_max', []) if u is not None]
        dias_sem_chuva = 0
        for p in reversed(precipitacao):
            if p < 0.1:
                dias_sem_chuva += 1
            else:
                break
        return {
            'precipitacao': round(sum(precipitacao) / len(precipitacao), 2) if precipitacao else None,
            'umidade': round(sum(umidade_list) / len(umidade_list), 2) if umidade_list else None,
            'dias_sem_chuva': dias_sem_chuva
        }
    except Exception:
        return {'precipitacao': None, 'umidade': None, 'dias_sem_chuva': None}


def _coletar_inpe(latitude, longitude, raio=0.5):
    
    # INPE TerraBrasilis: áreas de desmatamento próximas
    try:
        bbox = f"{longitude-raio},{latitude-raio},{longitude+raio},{latitude+raio}"
        params = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeName': 'prodes-amz-nb:yearly_deforestation_biome',
            'outputFormat': 'application/json',
            'bbox': bbox,
            'count': 10
        }
        
        resp = requests.get(INPE_URL, params=params, timeout=15)
        resp.raise_for_status()
        return {'areas_desmatamento': resp.json().get('totalFeatures', 0)}
    except Exception:
        return {'areas_desmatamento': 0}


def _estimar_ndvi(bioma='default'):
    
    # Estima NDVI por bioma como fallback (NASA EarthData requer autenticação)
    faixa = NDVI_POR_BIOMA.get(bioma, NDVI_POR_BIOMA['default'])
    return round(random.uniform(faixa[0], faixa[1]), 4)


def coletar_todos(latitude, longitude, bioma='default'):
    """
    Orquestra coleta de todas as APIs espaciais para uma coordenada.
    Retorna dicionário pronto para alimentar os modelos de ML.
    """
    
    power = _coletar_nasa_power(latitude, longitude)
    firms = _coletar_nasa_firms(latitude, longitude)
    meteo = _coletar_open_meteo(latitude, longitude)
    inpe = _coletar_inpe(latitude, longitude)
    ndvi = _estimar_ndvi(bioma)
    
    return {
        'ndvi': ndvi,
        'temperatura': power.get('temperatura') or 28.0,
        'precipitacao': meteo.get('precipitacao') or 0.0,
        'umidade': meteo.get('umidade') or 50.0,
        'dias_sem_chuva': meteo.get('dias_sem_chuva') or 0,
        'radiacao_solar': power.get('radiacao_solar') or 20.0,
        'focos_calor': firms.get('focos_calor') or 0,
        'areas_desmatamento': inpe.get('areas_desmatamento') or 0,
        'fontes': {
            'nasa_power': 'temperatura, radiacao_solar',
            'nasa_firms': 'focos_calor',
            'open_meteo': 'precipitacao, umidade, dias_sem_chuva',
            'inpe_terrabrasilis': 'areas_desmatamento',
            'ndvi_estimado': f'bioma={bioma}'
        }
    }


if __name__ == '__main__':
    
    # Teste rápido com coordenadas de Sorriso/MT
    print("Testando coleta para Sorriso/MT...")
    resultado = coletar_todos(-12.5442, -55.7214, 'Cerrado')
    for k, v in resultado.items():
        print(f" {k}: {v}")