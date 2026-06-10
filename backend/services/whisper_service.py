from faster_whisper import WhisperModel
import os

class WhisperService:
    def __init__(self, model_size="small"):
        # "base" or "small" are good for local fast execution
        self.model_size = model_size
        self.model = None

    def _load_model(self):
        if self.model is None:
            # Use CPU for local development if CUDA isn't available
            # To be safe across Macs (M1/M2) and regular CPUs, using compute_type="int8" and cpu.
            # faster-whisper natively supports CT2 which runs fast on CPU.
            self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")

    def transcribe(self, audio_path: str) -> str:
        self._load_model()
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        transcript = []
        for segment in segments:
            transcript.append(segment.text)
            
        return " ".join(transcript).strip()
