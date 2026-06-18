from faster_whisper import WhisperModel
import os

import time

class WhisperService:
    def __init__(self, model_size="base"):
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
        start_time = time.time()
        
        # --- Debugging Logs ---
        import shutil
        os.makedirs("debug_audio", exist_ok=True)
        debug_path = os.path.join("debug_audio", os.path.basename(audio_path))
        shutil.copy2(audio_path, debug_path)
        
        file_size = os.path.getsize(audio_path)
        print("\n=== Whisper Debug Info ===")
        print(f"Audio Path: {audio_path}")
        print(f"Debug Copy Path: {debug_path}")
        print(f"File Size: {file_size} bytes")
        
        if file_size == 0:
            print("ERROR: Received empty audio file!")
            return ""
            
        self._load_model()
        
        # Add medical prompt to bias Whisper towards clinical terminology
        medical_prompt = "Adverse drug reaction report. Patient mentions drugs like Paracetamol, Amoxicillin, Ibuprofen, and symptoms like rash, swelling, nausea, dizziness, anaphylaxis."
        
        segments, info = self.model.transcribe(
            audio_path, 
            beam_size=5, 
            language="en", 
            vad_filter=False,
            initial_prompt=medical_prompt
        )
        
        transcript = []
        segment_count = 0
        for segment in segments:
            transcript.append(segment.text)
            segment_count += 1
            
        final_transcript = " ".join(transcript).strip()
        processing_time = time.time() - start_time
        
        print(f"Duration: {info.duration:.2f} seconds")
        print(f"Segment Count: {segment_count}")
        print(f"Transcript Length: {len(final_transcript)}")
        print(f"Processing Time: {processing_time:.2f} seconds")
        print(f"Language: {info.language} (Probability: {info.language_probability:.2f})")
        print(f"Transcript Content: '{final_transcript}'")
        print("==========================\n")
        
        return final_transcript
