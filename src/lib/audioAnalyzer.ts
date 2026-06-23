class AudioAnalyzer {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private audio: HTMLAudioElement | null = null;
  private initialized: boolean = false;

  init(audioElement: HTMLAudioElement) {
    if (this.initialized) return;
    
    this.audio = audioElement;
    
    // Create audio context only after user interaction
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContextClass();
    
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    this.source = this.context.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    
    this.initialized = true;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(128).fill(0); // Return empty array if not initialized
    }
    
    this.analyser.getByteFrequencyData(this.dataArray as any);
    return this.dataArray;
  }

  // Helper to get average frequency (bass, mid, treble)
  getAverageFrequency(range: 'bass' | 'mid' | 'treble'): number {
    const data = this.getFrequencyData();
    let start = 0;
    let end = 0;
    
    if (range === 'bass') {
      start = 0; end = 10; // lower frequencies
    } else if (range === 'mid') {
      start = 10; end = 60; // mid frequencies
    } else {
      start = 60; end = 128; // high frequencies
    }
    
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += data[i];
    }
    return sum / (end - start);
  }
}

export const audioAnalyzer = new AudioAnalyzer();
