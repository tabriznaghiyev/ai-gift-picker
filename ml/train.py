#!/usr/bin/env python3
"""
Train a binary classifier: (profile, product) -> relevant (1) or not (0).
Export to ONNX for Node.js inference.
Run from project root: python ml/train.py
Requires: ml/training_data.csv (run generate_training_data.py first), ml/feature_spec.json
Output: ml/model.onnx, ml/feature_spec.json (with category_list)
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

ML_DIR = Path(__file__).resolve().parent
TRAINING_CSV = ML_DIR / "training_data.csv"
SPEC_PATH = ML_DIR / "feature_spec.json"
MODEL_ONNX = ML_DIR / "model.onnx"

NUM_FEATURES = 30  # must match feature_spec.feature_names length


def main():
    if not TRAINING_CSV.exists():
        raise SystemExit("Run generate_training_data.py first to create training_data.csv")

    df = pd.read_csv(TRAINING_CSV)
    spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    feature_names = spec["feature_names"]
    if len(feature_names) != NUM_FEATURES:
        raise SystemExit(f"feature_spec has {len(feature_names)} features, expected {NUM_FEATURES}")

    X = df[feature_names].astype(np.float32)
    y = df["label"].astype(np.int64)

    # Train/validation split for evaluation
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
    print(f"Training samples: {len(X_train)}, validation: {len(X_val)}, positives (train): {y_train.sum()}")

    # Balanced class weight for imbalanced data (more negatives than positives)
    model = GradientBoostingClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.08,
        min_samples_leaf=20,
        subsample=0.85,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Quick validation metrics
    y_pred = model.predict(X_val)
    y_proba = model.predict_proba(X_val)[:, 1]
    print(f"Validation accuracy: {accuracy_score(y_val, y_pred):.4f}")
    print(f"Validation ROC-AUC: {roc_auc_score(y_val, y_proba):.4f}")

    # Retrain on full data for final model (so we use all data for production)
    model.fit(X, y)

    # Export to ONNX
    initial_type = [("float_input", FloatTensorType([None, NUM_FEATURES]))]
    onnx_model = convert_sklearn(
        model,
        initial_types=initial_type,
        target_opset=14,
        options={id(model): {"nocl": True}},
    )
    MODEL_ONNX.write_bytes(onnx_model.SerializeToString())
    print(f"Saved {MODEL_ONNX}")

    # Keep feature_spec with category_list for Node
    if "category_list" not in spec:
        spec["category_list"] = []
    SPEC_PATH.write_text(json.dumps(spec, indent=2), encoding="utf-8")
    print("Done. Use model.onnx and feature_spec.json in Next.js for inference.")


if __name__ == "__main__":
    main()
