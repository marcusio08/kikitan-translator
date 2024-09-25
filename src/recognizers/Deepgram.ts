import { Recognizer } from "./recognizer";
import { MicVAD, utils } from "@ricky0123/vad-web"

export class Deepgram extends Recognizer {
    callback: ((result: string) => void) | null = null;
    transcribing_callback: ((status: boolean) => void) | null = null;

    vad: MicVAD | null = null;
    speech_timeout: NodeJS.Timeout | null = null;
    timeout_stop: boolean = false;

    constructor(lang: string) {
        super(lang);

        MicVAD.new({
            workletURL: './vad.worklet.bundle.min.js',
            modelURL: './silero_vad.onnx',
            minSpeechFrames: 7.5,
            preSpeechPadFrames: 2,
            submitUserSpeechOnPause: true,
            onSpeechStart: () => {
                if (this.speech_timeout != null) clearTimeout(this.speech_timeout);

                this.speech_timeout = setTimeout(() => {  
                    this.stop();

                    setTimeout(() => {
                        this.start();

                        this.timeout_stop = true;
                    }, 500);
                }, 10000);
            },
            onVADMisfire: () => {
                if (this.timeout_stop) {
                    this.timeout_stop = false;
                    return;
                }
            },
            onSpeechEnd: async (audio) => {
                if (this.timeout_stop) {
                    this.timeout_stop = false;
                    return;
                }

                if (this.speech_timeout != null) clearTimeout(this.speech_timeout);
                if (this.transcribing_callback != null) this.transcribing_callback(true);

                const wavData = utils.encodeWAV(new Float32Array(audio));
                fetch('https://kikitan-translator.onrender.com/recognize/deepgram?src=' + this.language, {
                    method: 'POST',
                    body: wavData,
                    headers: {
                        'Content-Type': 'audio/wav'
                    }
                }).then((res) => res.json()).then((data) => {
                    this.callback?.(data.transcription);
                    if (this.transcribing_callback != null) this.transcribing_callback(false);
                });
            },
        }).then((vad) => {
            console.log("VAD loaded");

            this.vad = vad;
            this.start();
        });
    }

    start(): void {
        console.log("Starting VAD");
        this.vad?.start()
    }

    stop(): void {
        console.log("Stopping VAD");
        this.vad?.pause()
    }

    set_lang(lang: string): void {
        this.language = lang;
    }

    onResult(callback: (result: string) => void): void {
        this.callback = callback;
    }

    onTranscribing(callback: (status: boolean) => void): void {
        this.transcribing_callback = callback;
    }
}