// @vitest-environment node
import { decodeJwt } from 'jose';
import { describe, expect, it } from 'vitest';
import { MintTokenError, mintToken } from './mintToken';

const validArgs = {
  livekit_url: 'wss://test.livekit.cloud',
  livekit_api_key: 'API_TEST_KEY',
  livekit_api_secret: 'secret-that-is-long-enough-for-hs256',
  slug: 'drive-thru-coffee',
};

describe('lib/livekit/mintToken', () => {
  it('returns a JWT with the expected LiveKit claim shape', async () => {
    const { token, wsUrl, roomName, identity, expiresAt } = await mintToken(validArgs);

    expect(wsUrl).toBe(validArgs.livekit_url);
    expect(roomName.startsWith('drive-thru-coffee_')).toBe(true);
    expect(identity.startsWith('visitor_')).toBe(true);
    expect(expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));

    const decoded = decodeJwt(token) as Record<string, unknown> & {
      video?: Record<string, unknown>;
    };
    expect(decoded.iss).toBe(validArgs.livekit_api_key);
    expect(decoded.sub).toBe(identity);
    expect(decoded.exp).toBe(expiresAt);
    expect(decoded.video?.room).toBe(roomName);
    expect(decoded.video?.roomJoin).toBe(true);
    expect(decoded.video?.canPublish).toBe(true);
    expect(decoded.video?.canSubscribe).toBe(true);
    expect(decoded.video?.canPublishData).toBe(true);
  });

  it('respects custom identity and room overrides', async () => {
    const { token, identity, roomName } = await mintToken({
      ...validArgs,
      identity: 'alice',
      room: 'fixed-room',
    });
    expect(identity).toBe('alice');
    expect(roomName).toBe('fixed-room');
    const decoded = decodeJwt(token) as { sub?: string; video?: { room?: string } };
    expect(decoded.sub).toBe('alice');
    expect(decoded.video?.room).toBe('fixed-room');
  });

  it('rejects bad livekit_url', async () => {
    await expect(
      mintToken({ ...validArgs, livekit_url: 'http://not-ws.example' })
    ).rejects.toBeInstanceOf(MintTokenError);
    try {
      await mintToken({ ...validArgs, livekit_url: 'http://not-ws.example' });
    } catch (err) {
      const mte = err as MintTokenError;
      expect(mte.field).toBe('livekit_url');
    }
  });

  it('rejects empty livekit_api_key', async () => {
    await expect(mintToken({ ...validArgs, livekit_api_key: '' })).rejects.toBeInstanceOf(
      MintTokenError
    );
  });

  it('rejects empty livekit_api_secret', async () => {
    await expect(mintToken({ ...validArgs, livekit_api_secret: '' })).rejects.toBeInstanceOf(
      MintTokenError
    );
  });
});
