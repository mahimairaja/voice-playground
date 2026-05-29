import { cn } from '@/lib/shadcn/utils';

export interface CardPanelProps {
  title?: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  footer?: string;
  accent?: boolean;
  className?: string;
}

export function CardPanel({
  title,
  subtitle,
  body,
  image_url,
  footer,
  accent,
  className,
}: CardPanelProps) {
  return (
    <article
      className={cn(
        'rounded-[var(--radius-panel)] border bg-[color:var(--color-surface-2)] p-3.5',
        accent ? 'border-[color:var(--color-accent)]' : 'border-[color:var(--color-border)]',
        className
      )}
    >
      {subtitle && (
        <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {subtitle}
        </p>
      )}
      {title && (
        <h3
          className={cn(
            'text-[16px] leading-tight font-semibold text-[color:var(--color-text)]',
            subtitle && 'mt-1'
          )}
        >
          {title}
        </h3>
      )}
      {image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image_url}
          alt=""
          className="mt-3 block w-full rounded-[4px] border border-[color:var(--color-border)]"
        />
      )}
      {body && (
        <p
          className={cn(
            'text-[13px] text-[color:var(--color-text-dim)]',
            (image_url || title) && 'mt-2.5'
          )}
        >
          {body}
        </p>
      )}
      {footer && (
        <p className="mt-3 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {footer}
        </p>
      )}
    </article>
  );
}
