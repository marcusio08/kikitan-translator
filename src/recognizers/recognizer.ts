export abstract class Recognizer {
    language: string;
    running: boolean = false;

    constructor(lang: string) {
        this.language = lang;
    }

    abstract start(): void;
    abstract stop(): void;
    abstract set_lang(lang: string): void;

    abstract onResult(callback: (result: string) => void): void;
    abstract onTranscribing(callback: (status: boolean) => void): void;
}