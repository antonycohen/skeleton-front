import { useGetServiceAccountPermissionCatalog } from '@skeleton/core-api';
import { Checkbox, Skeleton } from '@skeleton/web-components';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';

type ServiceAccountPermissionPickerProps = {
  organizationId: string;
  /** Selected permissions in short form (e.g. `member:*:read`). */
  value: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
};

const pluralize = (word: string) =>
  word.endsWith('y')
    ? `${word.slice(0, -1)}ies`
    : word.endsWith('s')
      ? word
      : `${word}s`;

/** `member:*` -> "Members", `service-account:*` -> "Service accounts". */
const formatResourceLabel = (resource: string) => {
  const words = resource.split(':').filter((segment) => segment !== '*');
  if (words.length === 0) {
    return resource;
  }
  const label = [...words.slice(0, -1), pluralize(words[words.length - 1])].join(
    ' ',
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** `analyze-csv` -> "Analyze CSV". */
const formatActionLabel = (action: string) =>
  action
    .split('-')
    .map((word, index) =>
      word === 'csv'
        ? 'CSV'
        : index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word,
    )
    .join(' ');

export const ServiceAccountPermissionPicker = ({
  organizationId,
  value,
  onChange,
  disabled,
}: ServiceAccountPermissionPickerProps) => {
  const { t } = useTranslation();
  const { data: catalog, isLoading } = useGetServiceAccountPermissionCatalog({
    organizationId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border p-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-col gap-2 pl-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!catalog?.length) {
    return (
      <p className="text-sm text-destructive">
        {t('serviceAccounts.permissions.loadError')}
      </p>
    );
  }

  const selected = new Set(value);
  const allPermissions = catalog.flatMap(({ resource, actions }) =>
    actions.map((action) => `${resource}:${action}`),
  );
  const selectedCount = allPermissions.filter((permission) =>
    selected.has(permission),
  ).length;
  const allState =
    selectedCount === 0
      ? false
      : selectedCount === allPermissions.length
        ? true
        : ('indeterminate' as const);

  const togglePermission = (permission: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) {
      next.add(permission);
    } else {
      next.delete(permission);
    }
    onChange([...next]);
  };

  const toggleResource = (resource: string, actions: string[], checked: boolean) => {
    const next = new Set(selected);
    for (const action of actions) {
      if (checked) {
        next.add(`${resource}:${action}`);
      } else {
        next.delete(`${resource}:${action}`);
      }
    }
    onChange([...next]);
  };

  const toggleAll = (checked: boolean) => {
    const next = new Set(selected);
    for (const permission of allPermissions) {
      if (checked) {
        next.add(permission);
      } else {
        next.delete(permission);
      }
    }
    onChange([...next]);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2.5">
        <label
          className={cn(
            'flex items-center gap-2.5 text-sm font-medium',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          <Checkbox
            checked={allState}
            disabled={disabled}
            onCheckedChange={(checked) => toggleAll(checked === true)}
          />
          {t('serviceAccounts.permissions.selectAll')}
        </label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {t('serviceAccounts.permissions.selectedCount', {
            selected: selectedCount,
            total: allPermissions.length,
          })}
        </span>
      </div>

      <div className="flex max-h-72 flex-col divide-y divide-border overflow-y-auto">
        {catalog.map(({ resource, actions }) => {
          const resourceSelectedCount = actions.filter((action) =>
            selected.has(`${resource}:${action}`),
          ).length;
          const resourceState =
            resourceSelectedCount === 0
              ? false
              : resourceSelectedCount === actions.length
                ? true
                : ('indeterminate' as const);

          return (
            <div key={resource} className="flex flex-col gap-2.5 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <label
                  className={cn(
                    'flex items-center gap-2.5',
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                >
                  <Checkbox
                    checked={resourceState}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      toggleResource(resource, actions, checked === true)
                    }
                  />
                  <span className="text-sm font-medium">
                    {formatResourceLabel(resource)}
                  </span>
                </label>
                <code className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {resource}
                </code>
              </div>

              <div className="flex flex-col gap-2 pl-[26px]">
                {actions.map((action) => {
                  const permission = `${resource}:${action}`;
                  const isSelected = selected.has(permission);
                  return (
                    <label
                      key={permission}
                      className={cn(
                        'flex select-none items-center gap-2 text-sm text-foreground',
                        disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer',
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          togglePermission(permission, checked === true)
                        }
                      />
                      {formatActionLabel(action)}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
