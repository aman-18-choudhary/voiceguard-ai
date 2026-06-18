from .feature_extractor import AudioFeatureExtractor
from .stress_classifier import StressClassifier
from .shap_explainer import ShapExplainer
from schemas.ai_schemas import StressMetrics, ShapFeature

class StressPipeline:
    def __init__(self):
        self.extractor = AudioFeatureExtractor()
        self.classifier = StressClassifier()
        self.explainer = ShapExplainer()
        
    def analyze_audio(self, audio_path: str) -> StressMetrics:
        if not audio_path:
            return StressMetrics()
            
        print(f"\n[StressPipeline] Analyzing audio: {audio_path}")
        
        # 1. Extract Features
        features = self.extractor.extract_features(audio_path)
        print(f"[StressPipeline] Extracted features: {features}")
        
        # 2. Predict Stress
        prediction = self.classifier.predict(features)
        print(f"[StressPipeline] Prediction: {prediction}")
        
        # 3. Generate SHAP Explanation
        shap_values = self.explainer.explain(features, prediction)
        
        # 4. Format Output
        shap_features = [ShapFeature(**sv) for sv in shap_values]
        
        metrics = StressMetrics(
            stress_score=prediction["stress_score"],
            stress_level=prediction["stress_level"],
            pitch_mean=features["pitch_mean"],
            pitch_variance=features["pitch_variance"],
            speech_rate=features["speech_rate"],
            rms_energy=features["rms_energy"],
            shap_explanation=shap_features
        )
        
        return metrics

stress_pipeline = StressPipeline()
