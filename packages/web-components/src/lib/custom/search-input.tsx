import { SearchIcon } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';

/**
 * A search field: `InputGroup` with the magnifier, like the collections' toolbar, and a short
 * "Search…" placeholder. `label` says what it searches, for screen readers ("Search pages").
 */
export function SearchInput(props: { label: string; value: string; onValueChange: (value: string) => void; className?: string }) {
  const { t } = useTranslation();
  return (
    <InputGroup className={cn('w-full sm:w-64', props.className)}>
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={props.label}
        placeholder={t('components.searchInput.placeholder')}
        value={props.value}
        onChange={(event) => props.onValueChange(event.target.value)}
      />
    </InputGroup>
  );
}
