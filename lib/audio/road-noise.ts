import { type Room, Track } from 'livekit-client';

/**
 * Synthetic road-noise injector for stress-testing voice agents.
 *
 * The noise is generated live in the browser (no audio file): brown noise
 * (integrated white noise) through a low-pass filter for road rumble, into a
 * gain node (the slider). The gain feeds two places: the operator's speakers
 * (so they hear it) and a re-published microphone track (so the agent, and any
 * audio analysis it runs such as Tyto, hears the degraded line).
 *
 * Ordering matters: the audible monitor is wired and started FIRST and is
 * independent of the mic plumbing, so a getUserMedia/publish failure cannot
 * silence it. The AudioContext is resumed explicitly (browsers create it
 * suspended). It is opt-in: nothing runs until 'start' is called.
 */
export class RoadNoiseEngine {
  private ctx: AudioContext | null = null;
  private noiseGain: GainNode | null = null;
  private micGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private publishedTrack: MediaStreamTrack | null = null;
  private micStream: MediaStream | null = null;
  private room: Room | null = null;

  get active(): boolean {
    return this.ctx !== null;
  }

  async start(room: Room): Promise<void> {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.room = room;

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
      data[i] = last * 6; // healthy amplitude
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 600;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noise.connect(lowpass).connect(noiseGain);
    noiseGain.connect(ctx.destination); // monitor to the operator's speakers
    noise.start();

    this.noise = noise;
    this.noiseGain = noiseGain;
    console.info(
      '[road-noise] context',
      ctx.state,
      '- rumble running (raise the slider to hear it)'
    );

    // --- Best-effort: mix the rumble into the published mic so the agent hears
    // it too. A failure here must NOT silence the monitor above. ---
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const micSource = ctx.createMediaStreamSource(micStream);
      const micGain = ctx.createGain();
      micGain.gain.value = 1;
      micSource.connect(micGain);

      const mixDest = ctx.createMediaStreamDestination();
      micGain.connect(mixDest);
      noiseGain.connect(mixDest);

      await room.localParticipant.setMicrophoneEnabled(false);
      const track = mixDest.stream.getAudioTracks()[0];
      await room.localParticipant.publishTrack(track, { source: Track.Source.Microphone });

      this.micGain = micGain;
      this.micStream = micStream;
      this.publishedTrack = track;
      console.info('[road-noise] mixed into the published mic; the agent hears it too');
    } catch (err) {
      console.warn(
        '[road-noise] could not mix into the mic; you hear it but the agent may not',
        err
      );
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch {
        /* ignore: leave the mic as-is */
      }
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
    if (this.publishedTrack && this.room) {
      try {
        await this.room.localParticipant.unpublishTrack(this.publishedTrack, true);
      } catch {
        /* ignore unpublish failures during teardown */
      }
    }
    this.micStream?.getTracks().forEach((t) => t.stop());
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
    this.publishedTrack = null;
    this.micStream = null;
    this.room = null;
  }
}
