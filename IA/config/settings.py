import os
from dotenv import load_dotenv

load_dotenv()

# Flask
PORT = int(os.environ.get('PORT', 5000))
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.environ.get('SECRET_KEY', 'agrosat-gs-2026')

# Oracle
DB_USER = os.environ.get('DB_USER', 'RM568419')
DB_PASS = os.environ.get('DB_PASS', '250204')
DB_HOST = os.environ.get('DB_HOST', 'oracle.fiap.com.br')
DB_PORT = os.environ.get('DB_PORT', '1521')
DB_NAME = os.environ.get('DB_NAME', 'orcl')
DB_DSN = f"{DB_HOST}:{DB_PORT}/{DB_NAME}"

# NASA POWER
NASA_POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point'

# NASA FIRMS
NASA_FIRMS_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'
NASA_FIRMS_KEY = os.environ.get('NASA_FIRMS_KEY', 'DEMO_KEY')

# Open-Meteo
OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'

# INPE TerraBrasilis
INPE_URL = 'https://terrabrasilis.dpi.inpe.br/geoserver/ows'

# Copernicus ESA
COPERNICUS_URL = 'https://cds.climate.copernicus.eu/api/v2'

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PICKLES_DIR = os.path.join(BASE_DIR, 'pickles')
DATA_DIR = os.path.join(BASE_DIR, 'data')
