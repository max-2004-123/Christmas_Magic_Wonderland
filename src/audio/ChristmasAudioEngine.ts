import { CHRISTMAS_SONGS, ChristmasSong, MelodyNote } from '../data/songs';
import { NoteEvent } from '../types/wonderland';

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

type NoteListener = (event: NoteEvent) => void;

class ChristmasAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;

  private isPlaying = false;
  private trackIndex = 0;
  private noteIndex = 0;
  private volume = 0.55;
  private muted = false;

  private schedulerTimer: number | null = null;
  private nextNoteTime = 0;
  private listeners = new Set<NoteListener>();

  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      const ctx = new AudioCtx();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : this.volume;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.006;
      compressor.release.value = 0.2;

      const musicGain = ctx.createGain();
      musicGain.gain.value = 0.85;

      const sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.9;

      const dry = ctx.createGain();
      dry.gain.value = 0.68;

      const wet = ctx.createGain();
      wet.gain.value = 0.44;

      const reverb = ctx.createConvolver();
      reverb.buffer = this.createVelvetReverbImpulse(ctx, 2.7, 2.6);

      musicGain.connect(dry);
      musicGain.connect(reverb);
      sfxGain.connect(dry);
      sfxGain.connect(reverb);

      reverb.connect(wet);
      dry.connect(compressor);
      wet.connect(compressor);
      compressor.connect(master);
      master.connect(ctx.destination);

      this.masterGain = master;
      this.musicGain = musicGain;
      this.sfxGain = sfxGain;
      this.reverbNode = reverb;
      this.dryGain = dry;
      this.wetGain = wet;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private createVelvetReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay) * Math.min(1, i / (sampleRate * 0.02));
        const white = Math.random() * 2 - 1;
        // Soft lowpass smoothing so reverb feels warm & velvety
        prev = prev * 0.68 + white * 0.32;
        data[i] = prev * env * 0.6;
      }
    }
    return impulse;
  }

  public subscribeNotes(listener: NoteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitNote(event: NoteEvent) {
    this.listeners.forEach((fn) => fn(event));
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.updateMasterGain();
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.updateMasterGain();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private updateMasterGain() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.muted ? 0.0001 : Math.max(0.0001, this.volume);
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.muted ? 0 : target, now, 0.06);
  }

  public getCurrentTrack(): ChristmasSong {
    return CHRISTMAS_SONGS[this.trackIndex] ?? CHRISTMAS_SONGS[0];
  }

  public getTrackIndex(): number {
    return this.trackIndex;
  }

  public start(fadeInSeconds = 1.6) {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;

    if (this.isPlaying) return;
    this.isPlaying = true;

    const now = ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.001, now);
    this.musicGain.gain.linearRampToValueAtTime(0.88, now + fadeInSeconds);

    this.nextNoteTime = now + 0.08;
    this.startScheduler();
  }

  public pause() {
    this.isPlaying = false;
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  }

  public selectTrack(index: number, autoPlay = true) {
    const safeIdx = ((index % CHRISTMAS_SONGS.length) + CHRISTMAS_SONGS.length) % CHRISTMAS_SONGS.length;
    this.trackIndex = safeIdx;
    this.noteIndex = 0;

    if (this.isPlaying) {
      if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
      }
    } else if (autoPlay) {
      this.start(0.7);
    }
  }

  private startScheduler() {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
    }
    this.schedulerTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const lookahead = 0.18;
      while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
        this.scheduleCurrentNote();
      }
    }, 45);
  }

  private scheduleCurrentNote() {
    if (!this.ctx || !this.musicGain) return;
    const song = this.getCurrentTrack();
    const note: MelodyNote = song.notes[this.noteIndex];
    const secondsPerBeat = 60 / song.bpm;
    const duration = note.beats * secondsPerBeat;
    const time = this.nextNoteTime;

    if (note.midi !== null) {
      const vel = note.vel ?? 0.78;
      if (song.instrument === 'musicbox') {
        this.playMusicBoxVoice(note.midi, time, duration, vel, this.musicGain);
      } else if (song.instrument === 'celesta') {
        this.playCelestaVoice(note.midi, time, duration, vel, this.musicGain);
      } else {
        this.playFeltPianoVoice(note.midi, time, duration, vel, this.musicGain);
      }

      // Schedule visual note callback right around audio start
      const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
      const pitch = note.midi;
      const trackId = song.id;
      window.setTimeout(() => {
        if (this.isPlaying) {
          this.emitNote({ pitch, velocity: vel, trackId, timestamp: performance.now() });
        }
      }, delayMs);
    }

    if (note.chord && note.chord.length > 0) {
      note.chord.forEach((chordMidi, idx) => {
        // Gentle rolled harp/piano chord for romantic feel
        this.playWarmPadPianoVoice(
          chordMidi,
          time + idx * 0.028,
          Math.max(duration * 1.35, 0.9),
          0.22,
          this.musicGain!
        );
      });
    }

    if (note.bell) {
      this.playSleighBell(time, 0.065, this.musicGain);
    }

    this.nextNoteTime += duration;
    this.noteIndex += 1;
    if (this.noteIndex >= song.notes.length) {
      this.noteIndex = 0;
    }
  }

  private playMusicBoxVoice(
    midi: number,
    time: number,
    duration: number,
    vel: number,
    dest: AudioNode
  ) {
    if (!this.ctx) return;
    const freq = midiToFreq(midi);
    const release = Math.min(2.4, Math.max(1.1, duration * 1.6));

    // Fundamental pure chime
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    // Subtle glassy overtone
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    // Tiny music-box tine metallic ping
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(freq * 4.02, time);

    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.0001, time);
    g1.gain.linearRampToValueAtTime(vel * 0.24, time + 0.009);
    g1.gain.exponentialRampToValueAtTime(0.0001, time + release);

    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.0001, time);
    g2.gain.linearRampToValueAtTime(vel * 0.065, time + 0.006);
    g2.gain.exponentialRampToValueAtTime(0.0001, time + release * 0.55);

    const g3 = this.ctx.createGain();
    g3.gain.setValueAtTime(0.0001, time);
    g3.gain.linearRampToValueAtTime(vel * 0.032, time + 0.003);
    g3.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

    osc1.connect(g1).connect(dest);
    osc2.connect(g2).connect(dest);
    osc3.connect(g3).connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc3.start(time);
    osc1.stop(time + release + 0.05);
    osc2.stop(time + release + 0.05);
    osc3.stop(time + 0.2);
  }

  private playCelestaVoice(
    midi: number,
    time: number,
    duration: number,
    vel: number,
    dest: AudioNode
  ) {
    if (!this.ctx) return;
    const freq = midiToFreq(midi + 12); // Sweet sparkling upper octave celesta
    const release = Math.min(1.9, Math.max(0.75, duration * 1.4));

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    const oscLow = this.ctx.createOscillator();
    oscLow.type = 'triangle';
    oscLow.frequency.setValueAtTime(freq * 0.5, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, time);

    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.0001, time);
    g1.gain.linearRampToValueAtTime(vel * 0.18, time + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.0001, time + release);

    const gLow = this.ctx.createGain();
    gLow.gain.setValueAtTime(0.0001, time);
    gLow.gain.linearRampToValueAtTime(vel * 0.13, time + 0.012);
    gLow.gain.exponentialRampToValueAtTime(0.0001, time + release * 0.9);

    osc1.connect(g1).connect(filter).connect(dest);
    oscLow.connect(gLow).connect(filter);

    osc1.start(time);
    oscLow.start(time);
    osc1.stop(time + release + 0.05);
    oscLow.stop(time + release + 0.05);
  }

  private playFeltPianoVoice(
    midi: number,
    time: number,
    duration: number,
    vel: number,
    dest: AudioNode
  ) {
    if (!this.ctx) return;
    const freq = midiToFreq(midi);
    const release = Math.min(2.2, Math.max(0.85, duration * 1.5));

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);
    osc2.detune.setValueAtTime(3, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, time);
    filter.frequency.exponentialRampToValueAtTime(680, time + release);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vel * 0.25, time + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, time + release);

    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.0001, time);
    g2.gain.linearRampToValueAtTime(vel * 0.07, time + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, time + release * 0.5);

    osc1.connect(g).connect(filter).connect(dest);
    osc2.connect(g2).connect(filter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + release + 0.05);
    osc2.stop(time + release + 0.05);
  }

  private playWarmPadPianoVoice(
    midi: number,
    time: number,
    duration: number,
    vel: number,
    dest: AudioNode
  ) {
    if (!this.ctx) return;
    const freq = midiToFreq(midi);
    const release = Math.min(2.4, duration);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const oscSoft = this.ctx.createOscillator();
    oscSoft.type = 'triangle';
    oscSoft.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(920, time);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vel * 0.22, time + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, time + release);

    osc.connect(g);
    oscSoft.connect(g);
    g.connect(filter).connect(dest);

    osc.start(time);
    oscSoft.start(time);
    osc.stop(time + release + 0.05);
    oscSoft.stop(time + release + 0.05);
  }

  private playSleighBell(time: number, gainLevel: number, dest: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.2);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(7600, time);
    bandpass.Q.setValueAtTime(3.2, time);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gainLevel, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    noise.connect(bandpass).connect(g).connect(dest);
    noise.start(time);
  }

  // ===================== INTERACTIVE MAGICAL SFX =====================

  public playEnterWonderlandChord() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime + 0.03;
    const notes = [60, 64, 67, 71, 74, 79, 84]; // Lush Cmaj9 celestial swell
    notes.forEach((midi, idx) => {
      this.playMusicBoxVoice(midi, now + idx * 0.09, 2.2, 0.55, this.sfxGain!);
    });
    this.playSleighBell(now + 0.28, 0.11, this.sfxGain);
  }

  public playTreeWaveChime() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime + 0.01;
    const scale = [72, 74, 76, 79, 81, 84, 88];
    scale.forEach((midi, idx) => {
      this.playMusicBoxVoice(midi, now + idx * 0.055, 1.0, 0.42, this.sfxGain!);
    });
  }

  public playStarFireworkSound() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime + 0.01;
    // Sparkling high golden flourish
    const sparkle = [76, 79, 83, 88, 91, 96];
    sparkle.forEach((midi, idx) => {
      this.playCelestaVoice(midi - 12, now + idx * 0.045, 1.5, 0.5, this.sfxGain!);
    });
    // Soft warm distant velvet boom
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.45);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + 0.06);
    g.gain.linearRampToValueAtTime(0.2, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(g).connect(this.sfxGain);
    osc.start(now + 0.06);
    osc.stop(now + 0.55);

    this.playSleighBell(now + 0.14, 0.12, this.sfxGain);
  }

  public playGiftOpenSound() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime + 0.01;
    // Excited rattle then warm triumphant reveal chord
    this.playSleighBell(now + 0.05, 0.09, this.sfxGain);
    const reveal = [67, 72, 76, 79, 84];
    reveal.forEach((midi, idx) => {
      this.playMusicBoxVoice(midi, now + 0.28 + idx * 0.055, 1.6, 0.56, this.sfxGain!);
    });
  }

  public playSnowmanChime() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime + 0.01;
    // Cute playful bouncing 3-note chime
    const notes = [76, 81, 84, 88];
    notes.forEach((midi, idx) => {
      this.playMusicBoxVoice(midi, now + idx * 0.065, 0.75, 0.48, this.sfxGain!);
    });
  }
}

export const audioEngine = new ChristmasAudioEngine();
