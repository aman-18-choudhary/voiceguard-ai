import librosa
import numpy as np

class AudioFeatureExtractor:
    def extract_features(self, audio_path: str) -> dict:
        """Extracts acoustic features from an audio file using librosa."""
        try:
            y, sr = librosa.load(audio_path, sr=None)
            
            # Pitch extraction using librosa.piptrack
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            pitch_values = pitches[pitches > 0]
            pitch_mean = float(np.mean(pitch_values)) if len(pitch_values) > 0 else 0.0
            pitch_variance = float(np.var(pitch_values)) if len(pitch_values) > 0 else 0.0
            
            # RMS Energy
            rms = librosa.feature.rms(y=y)
            rms_energy = float(np.mean(rms))
            
            # Speech rate (proxy: zero crossing rate)
            zcr = librosa.feature.zero_crossing_rate(y)
            speech_rate = float(np.mean(zcr)) * 100 # Scaled for visibility
            
            return {
                "pitch_mean": round(pitch_mean, 2),
                "pitch_variance": round(pitch_variance, 2),
                "rms_energy": round(rms_energy, 4),
                "speech_rate": round(speech_rate, 2)
            }
        except Exception as e:
            print(f"Error extracting audio features: {e}")
            return {
                "pitch_mean": 0.0,
                "pitch_variance": 0.0,
                "rms_energy": 0.0,
                "speech_rate": 0.0
            }
