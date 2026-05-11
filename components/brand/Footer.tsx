import { cn } from '@/lib/shadcn/utils';
import pkg from '../../package.json';

interface FooterProps {
  status?: string;
  builtBy?: string;
  className?: string;
}

export function Footer({
  status = 'STATUS: OPERATIONAL',
  builtBy = 'Built by Mahimai AI',
  className,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className={cn(
        'mx-auto hidden w-full max-w-5xl px-6 pt-6 pb-8 md:block',
        'border-line-soft border-t border-dashed',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="tiny-mono">{builtBy}</span>
        <span className="tiny-mono inline-flex items-center gap-1.5">
          <span className="bg-accent-brand inline-block size-1.5 rounded-full" aria-hidden="true" />
          {status}
        </span>
        <span className="tiny-mono">
          v{pkg.version} · &copy; {year}
        </span>
      </div>
    </footer>
  );
}
