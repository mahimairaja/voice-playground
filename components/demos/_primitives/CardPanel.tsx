/**
 * Generative-UI primitive: a brand-styled .box with optional title/subtitle/
 * body/image/footer. Agents mount this via the dispatcher when they want to
 * surface a single piece of context (a selected listing, a confirmed order
 * line, a search result).
 *
 * Props are loose Records that arrive from the LiveKit data channel; defaults
 * here keep the component permissive (missing fields just disappear).
 */
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
    <article className={cn('box', accent && 'accent', className)} style={{ padding: 14 }}>
      {subtitle && <p className="tiny-mono">{subtitle}</p>}
      {title && (
        <h3 className="h-hand xl" style={{ marginTop: subtitle ? 4 : 0, lineHeight: 1.05 }}>
          {title}
        </h3>
      )}
      {image_url && (
        // Agent-supplied URL. Use a plain <img> so we can render arbitrary
        // remote hosts without configuring next.config.js. eslint-disable for
        // the @next/next/no-img-element rule scoped just to this line.
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
