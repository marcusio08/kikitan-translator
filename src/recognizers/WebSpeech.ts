import { Recognizer } from "./recognizer";

export class WebSpeech extends Recognizer {
    recognition: SpeechRecognition;
    transcribing_callback: ((status: boolean) => void) | null = null;

    constructor(lang: string) {
        super(lang);

        this.recognition = new window.webkitSpeechRecognition();
        this.recognition.interimResults = true
        this.recognition.maxAlternatives = 1
        this.recognition.continuous = true
        this.recognition.lang = lang;
    }

    start() {
        this.running = true;
        try {
            this.recognition.start();
        } catch (e) {
            console.log(e)
        }

        this.recognition.onend = () => {
            if (this.running) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.log(e)
                    }
                }, 500);
            }
        }

        this.recognition.onnomatch = () => {
            if (this.running) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.log(e)
                    }
                }, 500);
            }
        }

        this.recognition.onerror = (e) => {
            console.log(e)

            if (this.running) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.log(e)
                    }
                }, 500);
            }
        }
    }

    stop() {
        this.running = false;
        this.recognition.stop();
    }

    set_lang(lang: string) {
        this.recognition.lang = lang;

        this.recognition.stop();

        setTimeout(() => {
            this.recognition.start();
        }, 500);
    }

    onResult(callback: (result: string) => void) {
        this.recognition.onresult = (event) => {
            if (event.results.length > 0) {
                callback(event.results[event.results.length - 1][0].transcript.trim());

                if (this.transcribing_callback != null) this.transcribing_callback(!event.results[event.results.length - 1].isFinal);
            }
        }
    }

    onTranscribing(callback: (status: boolean) => void): void {
        this.transcribing_callback = callback;
    }
}