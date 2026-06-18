from services.stress.feature_extractor import AudioFeatureExtractor
from services.stress.stress_classifier import StressClassifier
import os

def test_stress_classifier_bounds():
    classifier = StressClassifier()
    
    # Test extreme high values
    high_features = {
        "pitch_variance": 5000,
        "speech_rate": 15.0,
        "rms_energy": 0.5
    }
    
    res = classifier.predict(high_features)
    assert 0 <= res["stress_score"] <= 100
    
    # Test zero values
    low_features = {
        "pitch_variance": 0,
        "speech_rate": 0,
        "rms_energy": 0
    }
    
    res = classifier.predict(low_features)
    assert 0 <= res["stress_score"] <= 100
