export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private samples: Map<string, AudioBuffer> = new Map();
  private activeNodes: Set<AudioBufferSourceNode> = new Set();
  private instrument: string = "acoustic_grand_piano";

  constructor() {
    if (typeof window !== "undefined") {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.ctx.destination);
    }
  }

  getAnalyser() {
    return this.analyser;
  }

  setInstrument(instrument: string) {
    this.instrument = instrument;
  }

  private getNoteName(pitch: number): string {
    const keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const octave = Math.floor((pitch - 12) / 12);
    return keys[pitch % 12] + octave;
  }

  async loadNote(pitch: number): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    const noteName = this.getNoteName(pitch);
    const key = `${this.instrument}_${noteName}`;
    
    if (this.samples.has(key)) return this.samples.get(key)!;

    const url = `/soundfonts/${this.instrument}/${noteName}.wav`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const arrayBuffer = await resp.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.samples.set(key, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.error(`Failed to load note: ${noteName}`, e);
      return null;
    }
  }

  playNote(pitch: number, time: number = 0, duration: number = 1) {
    if (!this.ctx || !this.analyser) return;
    
    this.loadNote(pitch).then((buffer) => {
      if (!buffer || !this.ctx || !this.analyser) return;
      
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + time + duration);
      
      source.connect(gain);
      gain.connect(this.analyser!);
      
      source.start(this.ctx.currentTime + time);
      source.stop(this.ctx.currentTime + time + duration);
      
      this.activeNodes.add(source);
      source.onended = () => this.activeNodes.delete(source);
    });
  }

  async exportToWav(notes: { time: number; pitch: number; duration: number }[], speed: number): Promise<Blob> {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    
    const speedFactor = 100 / speed;
    const totalDuration = Math.max(...notes.map(n => n.time + n.duration)) * speedFactor;
    const sampleRate = this.ctx.sampleRate;
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(totalDuration * sampleRate), sampleRate);
    
    for (const note of notes) {
      const buffer = await this.loadNote(note.pitch);
      if (buffer) {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        const gain = offlineCtx.createGain();
        const startTime = note.time * speedFactor;
        const duration = note.duration * speedFactor;
        
        gain.gain.setValueAtTime(0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        source.connect(gain);
        gain.connect(offlineCtx.destination);
        source.start(startTime);
        source.stop(startTime + duration);
      }
    }
    
    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  private bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);         // length of format chunk
    setUint16(1);          // PCM format
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);         // bits per sample
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([bufferArray], { type: "audio/wav" });
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    this.activeNodes.clear();
  }
}

export const audioEngine = new AudioEngine();
