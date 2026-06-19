'use client';

/**
 * Desk-side language picker for the interpreter. The host sets the language the
 * desk speaks; everything the guest says is rendered into it and back. The value
 * rides the agent-dispatch metadata at connect, so it is locked once a session
 * is live (changing it means reconnecting).
 */

export const TARGET_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Hindi',
  'Arabic',
  'Portuguese',
] as const;

export const DEFAULT_TARGET_LANGUAGE = 'English';

export function TargetLanguageSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase">
      target language
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Target language"
        className="rounded-[var(--radius-input)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-2.5 py-1.5 font-mono text-[12px] tracking-[0.02em] text-[color:var(--color-text-dim)] normal-case disabled:opacity-50"
      >
        {TARGET_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </label>
  );
}
