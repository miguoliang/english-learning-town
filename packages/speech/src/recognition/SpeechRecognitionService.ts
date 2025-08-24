/**
 * Simple speech recognition service using Web Speech API
 * This is a minimal implementation for the English Learning Town game
 */
export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    this.initialize();
  }

  static isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  private initialize(): void {
    if (!SpeechRecognitionService.isSupported()) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }

      if (this.isListening) {
        resolve('Already listening');
        return;
      }

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  get listening(): boolean {
    return this.isListening;
  }
}