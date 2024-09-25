from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)

class DeepgramTranscriber:
    deepgram: DeepgramClient = None
    
    def __init__(self, api_key: str):
        self.deepgram = DeepgramClient(api_key=api_key)
    
    def transcribe(self, audio: bytes, lang: str) -> str:
        payload: FileSource = {
            "buffer": audio,
        }
        
        options: PrerecordedOptions = PrerecordedOptions(
            model="nova-2",
            punctuate=True
        )
        
        if lang != "auto":
            if "en-" in lang:
                options.language = "en"
            elif "es-" in lang:
                options.language = "es"
            else:
                options.language = lang
        
        response = self.deepgram.listen.rest.v("1").transcribe_file(payload, options)
        
        return response.results.channels[0].alternatives[0].transcript