import random

class StressClassifier:
    def __init__(self):
        # Mocking an XGBoost classifier for now
        pass
        
    def predict(self, features: dict) -> dict:
        """Predicts stress score based on audio features."""
        # Dummy logic: higher pitch variance and speech rate = higher stress
        base_stress = 30
        
        # Simple heuristics for dummy model
        pitch_factor = min(features.get("pitch_variance", 0) / 1000, 30) 
        rate_factor = min(features.get("speech_rate", 0) * 2, 30)
        energy_factor = min(features.get("rms_energy", 0) * 100, 20)
        
        score = int(base_stress + pitch_factor + rate_factor + energy_factor)
        
        # Add some randomness for realism
        score = min(max(score + random.randint(-5, 10), 0), 100)
        
        if score < 40:
            level = "LOW"
        elif score < 70:
            level = "MODERATE"
        else:
            level = "HIGH"
            
        return {
            "stress_score": score,
            "stress_level": level
        }
