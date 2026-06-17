import { type Room, Track } from 'livekit-client';

/**
 * Synthetic road-noise injector for stress-testing voice agents.
 *
 * The noise is generated live in the browser (no audio file): brown noise
 * (integrated white noise) into a gain node (the slider). The gain feeds two
 * places: the operator's speakers (so they hear it) and the published mic.
 *
 * The mic injection uses LocalTrack.replaceTrack(): it swaps the media on the
 * SAME RTP sender, so the agent keeps its subscription and its audio tap never
 * breaks. (Re-publishing the mic, which an earlier version did, severed the
 * agent's score loop and froze the HUD.) A clone of the live mic is the voice
 * source, so it stays alive regardless of the swap. Opt-in: nothing runs until
 * 'start' is called.
 */
export class RoadNoiseEngine {
  private ctx: AudioContext | null = null;
  private noiseGain: GainNode | null = null;
  private micGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private micClone: MediaStreamTrack | null = null;
  private mixedTrack: MediaStreamTrack | null = null;

  get active(): boolean {
    return this.ctx !== null;
  }

  async start(room: Room): Promise<void> {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;

    // Browsers create the context suspended; resume it (we are inside the
    // slider's user gesture) or nothing plays.
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // --- Audible rumble first, independent of the mic plumbing ---
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 12; // calibrated so full slider reads ~0.9 noise on Tyto
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    // No low-pass: low-passed rumble reads as room reverb to Tyto, not noise.
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination); // monitor to the operator's speakers
    noise.start();

    this.noise = noise;
    this.noiseGain = noiseGain;
    console.info('[road-noise] context', ctx.state, '- rumble running');

    // --- Mix the rumble into the published mic via replaceTrack: swap the
    // sender's media in place so the agent keeps its subscription (no
    // re-publish, no re-subscribe). A failure here must NOT silence the
    // monitor above. ---
    try {
      const micTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track;
      const micMedia = micTrack?.mediaStreamTrack;
      if (!micTrack || !micMedia) throw new Error('no live microphone track to mix');

      // Clone the live mic so our voice source survives the swap below.
      const micClone = micMedia.clone();
      const micSource = ctx.createMediaStreamSource(new MediaStream([micClone]));
      const micGain = ctx.createGain();
      micGain.gain.value = 1;
      micSource.connect(micGain);

      const mixDest = ctx.createMediaStreamDestination();
      micGain.connect(mixDest);
      noiseGain.connect(mixDest);

      const mixed = mixDest.stream.getAudioTracks()[0];
      // Swap in place: the agent stays subscribed to the same track; only the
      // content (voice + noise) changes. userProvidedTrack=true: we own it.
      await micTrack.replaceTrack(mixed, true);

      this.micGain = micGain;
      this.micClone = micClone;
      this.mixedTrack = mixed;
      console.info('[road-noise] swapped mic media to voice+rumble (no re-subscribe)');
    } catch (err) {
      console.warn('[road-noise] mic mix failed; you hear it but the agent may not', err);
    }
  }

  /** Slider 0..1 maps straight to the noise gain. */
  setLevel(level: number): void {
    if (this.noiseGain) {
      this.noiseGain.gain.value = Math.max(0, Math.min(1, level));
    }
  }

  setMicMuted(muted: boolean): void {
    if (this.micGain) this.micGain.gain.value = muted ? 0 : 1;
  }

  async stop(): Promise<void> {
    try {
      this.noise?.stop();
    } catch {
      /* already stopped */
    }
    this.micClone?.stop();
    this.mixedTrack?.stop();
    if (this.ctx) {
      try {
        await this.ctx.close();
      } catch {
        /* ignore close failures */
      }
    }
    this.ctx = null;
    this.noiseGain = null;
    this.micGain = null;
    this.noise = null;
    this.micClone = null;
    this.mixedTrack = null;
  }
}
