import { version as tensumVersion } from '../../../../packages/tensum/package.json';
import { Badge } from './ui/badge';

export function HeaderBrand() {
  return (
    <div className="flex items-center gap-3">
      <a
        href="#main-content"
        className="flex items-center gap-2 type-display text-lg"
        aria-label="Tensum home"
      >
        <img src="/logo.svg" alt="" aria-hidden="true" className="h-4 w-auto dark:invert" />
        <h1>tensum</h1>
      </a>
      <Badge className="hidden sm:block" variant="secondary">
        {tensumVersion}
      </Badge>
    </div>
  );
}
