"""
Passo 2 do pipeline ML — Regressão de risco hídrico.
Execute: python modelos/regressao.py
Treina RandomForestRegressor e salva .pickle em /pickles
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET = os.path.join(BASE_DIR, 'data', 'agrosat_dataset.csv')
PICKLES_DIR = os.path.join(BASE_DIR, 'pickles')

FEATURES = ['ndvi', 'temperatura', 'precipitacao', 'umidade', 'dias_sem_chuva', 'radiacao_solar']
TARGET = 'risco_hidrico'


def carregar_dados():
    # Carrega e valida dataset
    df = pd.read_csv(DATASET)
    print(f"Dataset carregado: {df.shape[0]} registros, {df.shape[1]} colunas")
    print(f"Nulos: {df.isnull().sum().sum()}")
    print(f"Risco hídrico — min: {df[TARGET].min():.2f} | max: {df[TARGET].max():.2f} | média: {df[TARGET].mean():.2f}")
    return df


def treinar():
    df = carregar_dados()
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Treino: {len(X_train)} | Teste: {len(X_test)}")

    reg = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    reg.fit(X_train, y_train)

    y_pred = reg.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n=== MÉTRICAS — REGRESSÃO ===")
    print(f"MAE:  {mae:.4f} (erro médio absoluto em %)")
    print(f"RMSE: {rmse:.4f} (raiz do erro quadrático)")
    print(f"R²:   {r2:.4f} ({r2*100:.1f}% da variância explicada)")

    os.makedirs(PICKLES_DIR, exist_ok=True)
    joblib.dump(reg, os.path.join(PICKLES_DIR, 'modelo_regressao.pickle'))
    print("Salvo: modelo_regressao.pickle")
    return reg


if __name__ == '__main__':
    treinar()