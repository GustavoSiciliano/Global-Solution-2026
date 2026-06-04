"""
Passo 1 do pipeline ML — Classificação de vegetação.
Execute: python modelos/classificacao.py
Treina RandomForestClassifier e salva .pickle em /pickles
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, classification_report
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET = os.path.join(BASE_DIR, 'data', 'agrosat_dataset.csv')
PICKLES_DIR = os.path.join(BASE_DIR, 'pickles')

FEATURES = ['ndvi', 'temperatura', 'precipitacao', 'umidade', 'dias_sem_chuva', 'radiacao_solar']
TARGET = 'status_vegetacao'


def carregar_dados():
    # Carrega e valida dataset
    df = pd.read_csv(DATASET)
    print(f"Dataset carregado: {df.shape[0]} registros, {df.shape[1]} colunas")
    print(f"Nulos: {df.isnull().sum().sum()}")
    print(f"Distribuição:\n{df[TARGET].value_counts()}")
    return df


def treinar():
    df = carregar_dados()
    X = df[FEATURES]

    le = LabelEncoder()
    y = le.fit_transform(df[TARGET])
    print(f"\nClasses: {dict(zip(le.classes_, le.transform(le.classes_)))}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Treino: {len(X_train)} | Teste: {len(X_test)}")

    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("\n=== MÉTRICAS — CLASSIFICAÇÃO ===")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred, average='weighted'):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred, average='weighted'):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred, average='weighted'):.4f}")
    print(f"\nRelatório completo:\n{classification_report(y_test, y_pred, target_names=le.classes_)}")

    os.makedirs(PICKLES_DIR, exist_ok=True)
    joblib.dump(clf, os.path.join(PICKLES_DIR, 'modelo_classificacao.pickle'))
    joblib.dump(le, os.path.join(PICKLES_DIR, 'label_encoder.pickle'))
    print("Salvo: modelo_classificacao.pickle")
    print("Salvo: label_encoder.pickle")
    return clf, le


if __name__ == '__main__':
    treinar()