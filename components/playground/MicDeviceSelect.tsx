'use client';

import { useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { useMaybeRoomContext, useMediaDeviceSelect } from '@livekit/components-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Strip the trailing USB hardware id browsers append to device labels, e.g.
 * "USB Condenser Microphone (31b2:0011)" -> "USB Condenser Microphone". Leaves
 * meaningful parentheticals like "(Built-in)" alone.
 */
function cleanDeviceLabel(label: string): string {
  return label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, '').trim();
}

/**
 * Microphone device picker for the live voice panel. Thin composition over
 * LiveKit's stable useMediaDeviceSelect: permissions are requested lazily on
 * first open, and the control hides itself when fewer than two input devices
 * exist (nothing to choose).
 */
export function MicDeviceSelect() {
  const room = useMaybeRoomContext();
  const [open, setOpen] = useState(false);
  const [requestPermissions, setRequestPermissions] = useState(false);
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    room,
    kind: 'audioinput',
    requestPermissions,
  });

  const filtered = useMemo(() => devices.filter((d) => d.deviceId !== ''), [devices]);
  if (filtered.length < 2) return null;

  return (
    <Select
      open={open}
      value={activeDeviceId}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRequestPermissions(true);
      }}
      onValueChange={(deviceId) => void setActiveMediaDevice(deviceId)}
    >
      <SelectTrigger
        size="sm"
        aria-label="Choose microphone"
        className="border-[color:var(--color-border)] font-mono text-[12px] text-[color:var(--color-text-dim)]"
      >
        <Mic size={13} aria-hidden="true" />
        <SelectValue placeholder="microphone" />
      </SelectTrigger>
      <SelectContent position="popper">
        {filtered.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId} className="font-mono text-xs">
            {cleanDeviceLabel(device.label)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
