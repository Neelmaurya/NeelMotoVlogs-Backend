import asyncio
import edge_tts
import os
import subprocess

VOICES = {
    "english": {
        "female": [
            {"id": "en-IN-NeerjaNeural",  "name": "Neerja (Indian Female)",  "lang": "en"},
            {"id": "en-US-JennyNeural",   "name": "Jenny (US Female)",       "lang": "en"},
            {"id": "en-GB-SoniaNeural",   "name": "Sonia (British Female)",  "lang": "en"},
        ],
        "male": [
            {"id": "en-IN-PrabhatNeural", "name": "Prabhat (Indian Male)",   "lang": "en"},
            {"id": "en-US-GuyNeural",     "name": "Guy (US Male)",           "lang": "en"},
        ]
    },
    "hindi": {
        "female": [
            {"id": "hi-IN-SwaraNeural",   "name": "Swara (Hindi Female)",    "lang": "hi"},
            {"id": "hi-IN-RehaNeural",    "name": "Reha (Hindi Female)",     "lang": "hi"},
            {"id": "hi-IN-ShantiNeural",  "name": "Shanti (Hindi Female)",   "lang": "hi"},
        ],
        "male": [
            {"id": "hi-IN-MadhurNeural",  "name": "Madhur (Hindi Male)",     "lang": "hi"},
            {"id": "hi-IN-ArjunNeural",   "name": "Arjun (Hindi Male Deep)", "lang": "hi"},
        ]
    }
}


async def _generate_async(text: str, voice_id: str, output_path: str):
    communicate = edge_tts.Communicate(text, voice_id)
    await communicate.save(output_path)


def generate_audio(text: str, voice_id: str, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    asyncio.run(_generate_async(text, voice_id, output_path))
    return output_path


def get_audio_duration(audio_path: str) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", audio_path],
        capture_output=True, text=True
    )
    try:
        return float(result.stdout.strip())
    except Exception:
        # Fallback to a estimated word count duration if ffprobe fails
        return 60.0


def get_all_voices() -> dict:
    return VOICES
