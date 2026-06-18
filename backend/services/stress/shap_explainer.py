class ShapExplainer:
    def __init__(self):
        # Mocking a SHAP TreeExplainer
        pass
        
    def explain(self, features: dict, prediction: dict) -> list:
        """Returns dummy SHAP values for the prediction."""
        
        # Calculate pseudo-impacts based on features
        impacts = []
        
        # Pitch Variance impact
        pv = features.get("pitch_variance", 0)
        pv_impact = round((pv / 1000) / 30, 2)
        impacts.append({"feature": "pitch_variance", "impact": pv_impact})
        
        # Speech Rate impact
        sr = features.get("speech_rate", 0)
        sr_impact = round((sr * 2) / 30, 2)
        impacts.append({"feature": "speech_rate", "impact": sr_impact})
        
        # Energy impact
        energy = features.get("rms_energy", 0)
        energy_impact = round((energy * 100) / 20, 2)
        impacts.append({"feature": "rms_energy", "impact": energy_impact})
        
        # Sort by absolute impact
        impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
        
        return impacts
