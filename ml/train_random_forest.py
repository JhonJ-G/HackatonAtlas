#!/usr/bin/env python3
"""
Atlas Inteligente de Potencial Energético de Colombia
Script de entrenamiento Random Forest para clasificación multiclase
de potencial de energía renovable por municipio
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.utils.class_weight import compute_class_weight
from imblearn.over_sampling import RandomOverSampler
import joblib
import warnings

warnings.filterwarnings('ignore')

def load_and_clean_data(csv_path):
    """Cargar y limpiar el dataset"""
    print("📊 Cargando dataset...")
    df = pd.read_csv(csv_path)
    print(f"Dataset original: {len(df)} filas")
    
    # Mostrar distribución de clases original
    print("\n🏷️ Distribución de clases original:")
    print(df['potencial'].value_counts())
    
    # Eliminar filas con valores nulos en features críticos
    numeric_features = ['latitud', 'longitud', 'altitud_msnm', 'radiacion_kWhm2_dia', 
                       'viento_ms', 'temperatura_C', 'humedad_relativa_pct', 'nubosidad_pct']
    
    initial_len = len(df)
    df = df.dropna(subset=numeric_features + ['tipo_red'])
    print(f"Después de eliminar nulos: {len(df)} filas ({initial_len - len(df)} eliminadas)")
    
    return df

def prepare_features(df):
    """Preparar features para el modelo"""
    print("🔧 Preparando features...")
    
    # Features numéricas
    numeric_features = ['latitud', 'longitud', 'altitud_msnm', 'radiacion_kWhm2_dia', 
                       'viento_ms', 'temperatura_C', 'humedad_relativa_pct', 'nubosidad_pct']
    
    X_numeric = df[numeric_features].copy()
    
    # One-hot encoding para tipo_red
    tipo_red_dummies = pd.get_dummies(df['tipo_red'], prefix='tipo_red')
    
    # Combinar features
    X = pd.concat([X_numeric, tipo_red_dummies], axis=1)
    
    print(f"Features finales: {list(X.columns)}")
    print(f"Dimensión de X: {X.shape}")
    
    return X, X.columns.tolist()

def train_model(X, y):
    """Entrenar modelo Random Forest con búsqueda de hiperparámetros"""
    print("🌲 Entrenando Random Forest...")
    
    # Split estratificado
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    print(f"Train: {len(X_train)} filas, Test: {len(X_test)} filas")
    
    # Balanceo de clases con oversampling
    print("⚖️ Aplicando oversampling...")
    ros = RandomOverSampler(random_state=42)
    X_train_balanced, y_train_balanced = ros.fit_resample(X_train, y_train)
    
    print("Distribución después de oversampling:")
    unique, counts = np.unique(y_train_balanced, return_counts=True)
    for u, c in zip(unique, counts):
        print(f"  {u}: {c}")
    
    # Búsqueda de hiperparámetros
    print("🔍 Búsqueda de hiperparámetros...")
    param_grid = {
        'n_estimators': [300, 500],
        'max_depth': [8, 12, 15],
        'min_samples_split': [5, 10],
        'min_samples_leaf': [2, 4],
        'class_weight': ['balanced']
    }
    
    rf_base = RandomForestClassifier(random_state=42)
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    
    grid_search = GridSearchCV(
        rf_base, param_grid, cv=cv, 
        scoring='f1_macro', n_jobs=-1, verbose=1
    )
    
    grid_search.fit(X_train_balanced, y_train_balanced)
    
    print(f"✅ Mejores parámetros: {grid_search.best_params_}")
    print(f"✅ Mejor score (F1-macro): {grid_search.best_score_:.4f}")
    
    # Modelo final
    best_rf = grid_search.best_estimator_
    
    # Evaluación en test
    y_pred = best_rf.predict(X_test)
    y_pred_proba = best_rf.predict_proba(X_test)
    
    # Métricas
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred)
    
    print(f"\n📈 Resultados en Test Set:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Macro F1: {report['macro avg']['f1-score']:.4f}")
    print(f"Weighted F1: {report['weighted avg']['f1-score']:.4f}")
    
    print("\n📊 Reporte por clase:")
    for class_name in ['solar', 'eolica', 'hibrida']:
        if class_name in report:
            print(f"{class_name}: P={report[class_name]['precision']:.3f}, "
                  f"R={report[class_name]['recall']:.3f}, "
                  f"F1={report[class_name]['f1-score']:.3f}")
    
    metrics = {
        'accuracy': accuracy,
        'macro_f1': report['macro avg']['f1-score'],
        'weighted_f1': report['weighted avg']['f1-score'],
        'confusion_matrix': conf_matrix.tolist(),
        'classification_report': report,
        'best_params': grid_search.best_params_,
        'feature_importance': dict(zip(X.columns, best_rf.feature_importances_))
    }
    
    return best_rf, metrics, X_test, y_test, y_pred, y_pred_proba

def generate_predictions_for_all(model, df, feature_columns):
    """Generar predicciones para todo el dataset"""
    print("🔮 Generando predicciones para todos los municipios...")
    
    # Preparar features para todo el dataset
    X_full, _ = prepare_features(df)
    
    # Asegurar que las columnas coincidan
    X_full = X_full.reindex(columns=feature_columns, fill_value=0)
    
    # Predicciones
    predictions = model.predict(X_full)
    probabilities = model.predict_proba(X_full)
    
    # Crear dataframe con resultados
    results = df.copy()
    results['predicted_class'] = predictions
    
    # Agregar probabilidades
    classes = model.classes_
    for i, class_name in enumerate(classes):
        results[f'prob_{class_name}'] = probabilities[:, i]
    
    results['source_label'] = df['potencial']
    
    return results

def aggregate_by_department(results_df, confidence_threshold=0.7):
    """Agregar resultados por departamento con métricas de incertidumbre"""
    print("📍 Agregando resultados por departamento...")
    
    dept_stats = []
    
    for dept in results_df['departamento'].unique():
        dept_data = results_df[results_df['departamento'] == dept]
        
        total_municipios = len(dept_data)
        
        # Conteos por clase
        class_counts = dept_data['predicted_class'].value_counts()
        
        # Porcentajes por clase predicha
        solar_pct = class_counts.get('solar', 0) / total_municipios
        eolica_pct = class_counts.get('eolica', 0) / total_municipios
        hibrida_pct = class_counts.get('hibrida', 0) / total_municipios
        
        # Clase dominante
        dominant_class = class_counts.index[0] if len(class_counts) > 0 else 'desconocido'
        
        # Porcentaje de ZNI
        zni_pct = (dept_data['tipo_red'] == 'ZNI').sum() / total_municipios
        
        # === NUEVAS MÉTRICAS DE INCERTIDUMBRE ===
        
        # Porcentaje de municipios con etiqueta original 'desconocido'
        unknown_pct = (dept_data['source_label'] == 'desconocido').sum() / total_municipios
        
        # Porcentaje de municipios con alta confianza en la predicción
        max_probs = dept_data[['prob_solar', 'prob_eolica', 'prob_hibrida']].max(axis=1)
        high_confidence_pct = (max_probs >= confidence_threshold).sum() / total_municipios
        
        # Promedios de probabilidades por tecnología
        avg_solar_prob = dept_data['prob_solar'].mean()
        avg_eolica_prob = dept_data['prob_eolica'].mean()
        avg_hibrida_prob = dept_data['prob_hibrida'].mean()
        
        dept_stats.append({
            'departamento': dept,
            'num_municipios': total_municipios,
            'solar_pct': round(solar_pct, 3),
            'eolica_pct': round(eolica_pct, 3),
            'hibrida_pct': round(hibrida_pct, 3),
            'dominant_class': dominant_class,
            'zni_pct': round(zni_pct, 3),
            # Nuevas métricas de incertidumbre
            'unknown_pct': round(unknown_pct, 3),
            'high_confidence_pct': round(high_confidence_pct, 3),
            'avg_solar_prob': round(avg_solar_prob, 3),
            'avg_eolica_prob': round(avg_eolica_prob, 3),
            'avg_hibrida_prob': round(avg_hibrida_prob, 3),
            'confidence_threshold': confidence_threshold
        })
    
    return dept_stats

def save_results(results_df, dept_stats, metrics, feature_columns):
    """Guardar resultados en archivos JSON"""
    print("💾 Guardando resultados...")
    
    # Preparar datos de municipios para JSON
    municipios_data = []
    for _, row in results_df.iterrows():
        municipio_dict = {
            'departamento': row['departamento'],
            'municipio': row['municipio'],
            'codigo_dane_municipio': int(row['codigo_dane_municipio']),
            'latitud': float(row['latitud']),
            'longitud': float(row['longitud']),
            'tipo_red': row['tipo_red'],
            'predicted_class': row['predicted_class'],
            'source_label': row['source_label']
        }
        
        # Agregar probabilidades si existen
        for col in row.index:
            if col.startswith('prob_'):
                municipio_dict[col] = float(row[col])
        
        municipios_data.append(municipio_dict)
    
    # Archivo principal para el frontend
    output_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'model_type': 'RandomForest',
            'num_municipios': len(municipios_data),
            'num_departamentos': len(dept_stats),
            'feature_columns': feature_columns
        },
        'municipios': municipios_data,
        'departamentos': dept_stats
    }
    
    with open('municipio_predictions.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    # Métricas del modelo
    with open('metrics_random_forest.json', 'w', encoding='utf-8') as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)
    
    # Metadatos del modelo
    model_metadata = {
        'model_type': 'RandomForestClassifier',
        'training_date': datetime.now().isoformat(),
        'dataset_size': len(results_df),
        'feature_columns': feature_columns,
        'classes': ['solar', 'eolica', 'hibrida'],
        'best_params': metrics['best_params'],
        'performance': {
            'accuracy': metrics['accuracy'],
            'macro_f1': metrics['macro_f1'],
            'weighted_f1': metrics['weighted_f1']
        },
        'feature_importance': metrics['feature_importance']
    }
    
    with open('model_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(model_metadata, f, ensure_ascii=False, indent=2)
    
    print("✅ Archivos guardados:")
    print("  - municipio_predictions.json")
    print("  - metrics_random_forest.json") 
    print("  - model_metadata.json")

def main():
    """Función principal"""
    print("🚀 Atlas Inteligente de Potencial Energético - Entrenamiento ML")
    print("=" * 60)
    
    # Cargar y preparar datos
    csv_path = '../dataset_potencial_renovable_potencial.csv'
    df = load_and_clean_data(csv_path)
    
    # Filtrar clases de interés para entrenamiento
    df_train = df[df['potencial'].isin(['solar', 'eolica', 'hibrida'])].copy()
    print(f"\n🎯 Dataset para entrenamiento: {len(df_train)} filas")
    print("Distribución de clases para entrenamiento:")
    print(df_train['potencial'].value_counts())
    
    # Preparar features
    X, feature_columns = prepare_features(df_train)
    y = df_train['potencial'].values
    
    # Entrenar modelo
    model, metrics, X_test, y_test, y_pred, y_pred_proba = train_model(X, y)
    
    # Guardar modelo (opcional, para uso interno)
    joblib.dump(model, 'random_forest_model.pkl')
    print("✅ Modelo guardado como random_forest_model.pkl")
    
    # Generar predicciones para todo el dataset
    results_df = generate_predictions_for_all(model, df, feature_columns)
    
    # Agregar por departamento con métricas de incertidumbre
    confidence_threshold = 0.7  # Umbral de confianza para clasificar como "alta confianza"
    dept_stats = aggregate_by_department(results_df, confidence_threshold)
    
    # Guardar resultados
    save_results(results_df, dept_stats, metrics, feature_columns)
    
    print("\n🎉 Entrenamiento completado exitosamente!")
    print(f"✅ Total municipios procesados: {len(results_df)}")
    print(f"✅ Total departamentos: {len(dept_stats)}")
    print(f"✅ Accuracy del modelo: {metrics['accuracy']:.4f}")
    print(f"✅ F1-macro: {metrics['macro_f1']:.4f}")

if __name__ == "__main__":
    main()