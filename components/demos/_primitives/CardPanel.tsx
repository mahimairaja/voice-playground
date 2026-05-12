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
      className={cn('box', accent && 'accent brand-accent', className)}
      style={{ padding: 14 }}
    >
      {subtitle && <p className="tiny-mono">{subtitle}</p>}
      {title && (
        <h3 className="h-hand xl" style={{ marginTop: subtitle ? 4 : 0, lineHeight: 1.05 }}>
          {title}
        </h3>
      )}
      {image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image_url}
          alt=""
          className="mt-3 block w-full rounded-[4px]"
          style={{ border: '1px solid var(--line-soft)' }}
        />
      )}
      {body && (
        <p className="p-hand" style={{ marginTop: image_url || title ? 10 : 0 }}>
          {body}
        </p>
      )}
      {footer && <p className="tiny-mono mt-3">{footer}</p>}
    </article>
  );
}
