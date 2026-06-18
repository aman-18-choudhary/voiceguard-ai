import asyncio
from main import process_audio_pipeline

# Create a dummy valid wav file to test
import wave
import struct
import uuid
import os

report_id = f"TEST-{str(uuid.uuid4())[:8].upper()}"
file_path = f"/tmp/voiceguard/{report_id}_test.wav"

os.makedirs("/tmp/voiceguard", exist_ok=True)

# Generate 1s of silence
with wave.open(file_path, 'wb') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(16000)
    for _ in range(16000):
        wav_file.writeframes(struct.pack('h', 0))

print("Created silent wav. Running pipeline...")
process_audio_pipeline(report_id, "user-test", file_path)
print("Pipeline complete.")
