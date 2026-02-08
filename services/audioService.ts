
class AudioService {
  private audioContext: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private masterGain: GainNode | null = null;

  private async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      });
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.audioContext.currentTime);
      
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-15, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(20, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
      
      this.masterGain.connect(compressor);
      compressor.connect(this.audioContext.destination);
    }
  }

  public async resume() {
    await this.init();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public playCountdownBeep(isFinal: boolean = false) {
    if (!this.audioContext || !this.masterGain) return;
    const time = this.audioContext.currentTime;
    const freq = isFinal ? 880 : 440;
    
    this.playBrass(freq, 0.4, 0.6, time); // カウントダウンも少しブラスっぽく
  }

  public playBuzzer() {
    const time = this.audioContext!.currentTime;
    this.playBrass(110, 0.8, 0.8, time);
    this.playBrass(164.81, 0.6, 0.6, time + 0.1);
  }

  public playSuccess() {
    const time = this.audioContext!.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
      this.playBrass(f, 1.0, 0.5, time + i * 0.15);
    });
  }

  // ロッキー風の「勝ちに行く」サウンド
  public startMusic(tempo: 'fast' | 'slow' = 'fast') {
    if (!this.audioContext || this.isMusicPlaying || !this.masterGain) return;

    this.isMusicPlaying = true;
    const bpm = tempo === 'fast' ? 148 : 92;
    const stepDuration = 60 / bpm / 4; 

    let step = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.audioContext || !this.masterGain) return;
      const time = this.audioContext.currentTime;

      // --- STADIUM DRUMS ---
      if (step % 4 === 0) {
        this.playDeepKick(time);
      }
      if (step % 8 === 4) {
        this.playPowerSnare(time);
      }
      if (step % 2 === 1) {
        this.playNoise(0.04, 0.08, time); // High hats
      }

      // --- HEROIC BRASS / ORCHESTRA ---
      if (tempo === 'fast') {
        // ロッキーのテーマを彷彿とさせる4度・5度の上昇メロディライン
        // C -> G -> F -> G -> C (Octave)
        const melody = [
          261.63, 0, 392.00, 0, 
          349.23, 0, 392.00, 0,
          523.25, 523.25, 0, 440.00,
          392.00, 0, 329.63, 0
        ];
        const freq = melody[step % 16];
        if (freq > 0) {
          this.playBrass(freq, 0.5, 0.4, time);
          this.playBrass(freq * 0.5, 0.5, 0.2, time); // Low brass support
        }
      } else {
        // 休憩中は緊張感のある低音パルス
        if (step % 8 === 0) {
          this.playBrass(65.41, 0.8, 0.3, time); // Low C
        }
      }

      step = (step + 1) % 32;
    }, stepDuration * 1000);
  }

  private playBrass(freq: number, decay: number, gain: number, time: number) {
    if (!this.audioContext || !this.masterGain) return;
    
    // 金管楽器のような輝きを出すために3つの波形を重ねる
    const oscillators = [
      { type: 'sawtooth', f: freq, g: gain },
      { type: 'sawtooth', f: freq * 1.006, g: gain * 0.7 },
      { type: 'square', f: freq * 0.5, g: gain * 0.4 } // 厚み
    ] as const;

    oscillators.forEach(opt => {
      const osc = this.audioContext!.createOscillator();
      const g = this.audioContext!.createGain();
      const filter = this.audioContext!.createBiquadFilter();

      osc.type = opt.type;
      osc.frequency.setValueAtTime(opt.f, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 8, time);
      filter.frequency.exponentialRampToValueAtTime(freq * 2, time + decay);
      filter.Q.setValueAtTime(2, time);

      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(opt.g, time + 0.02); // クイックな立ち上がり
      g.gain.exponentialRampToValueAtTime(0.001, time + decay);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain!);
      
      osc.start(time);
      osc.stop(time + decay);
    });
  }

  private playDeepKick(time: number) {
    if (!this.audioContext || !this.masterGain) return;
    const osc = this.audioContext.createOscillator();
    const g = this.audioContext.createGain();
    // 超低域から落とす
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    g.gain.setValueAtTime(1.8, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playPowerSnare(time: number) {
    if (!this.audioContext || !this.masterGain) return;
    // ホワイトノイズ (スナッピー)
    this.playNoise(0.3, 0.25, time);
    // パンチのある中域
    const osc = this.audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    const g = this.audioContext.createGain();
    g.gain.setValueAtTime(0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playNoise(gain: number, decay: number, time: number) {
    if (!this.audioContext || !this.masterGain) return;
    const bufferSize = this.audioContext.sampleRate * decay;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    const g = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);
    
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + decay);
    
    source.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    source.start(time);
    source.stop(time + decay);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const audioService = new AudioService();
