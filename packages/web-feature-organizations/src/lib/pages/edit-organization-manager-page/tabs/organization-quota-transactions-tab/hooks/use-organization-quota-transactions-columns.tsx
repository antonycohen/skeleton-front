import { ColumnDef } from '@tanstack/react-table';
import { ReadQuotaTransaction } from '@skeleton/core-api-models';
import { Badge, LongText } from '@skeleton/web-components';
import { CollectionColumnHeader } from '@skeleton/web-collection';
import { cn } from '@skeleton/core-utils';
import { format } from 'date-fns';
import { useTranslation } from '@skeleton/core-translations';

type OperationStyle = {
  variant: 'outline' | 'default' | 'destructive' | 'secondary';
  className: string;
  labelKey: string;
  /** Sign expected for this operation (used to disambiguate the amount cell). */
  expectedSign: 'positive' | 'negative' | 'either';
};

const OPERATION_STYLE: Record<string, OperationStyle> = {
  CONSUME: {
    variant: 'outline',
    className: 'border-destructive/40 text-destructive',
    labelKey: 'adminOrganizations.quotaTransactions.operations.consume',
    expectedSign: 'positive',
  },
  ALLOCATE: {
    variant: 'outline',
    className: 'border-green-500/50 text-green-700',
    labelKey: 'adminOrganizations.quotaTransactions.operations.allocate',
    expectedSign: 'positive',
  },
  REFUND: {
    variant: 'outline',
    className: 'border-blue-500/50 text-blue-700',
    labelKey: 'adminOrganizations.quotaTransactions.operations.refund',
    expectedSign: 'negative',
  },
  RESET: {
    variant: 'outline',
    className: 'border-yellow-500/50 text-yellow-800',
    labelKey: 'adminOrganizations.quotaTransactions.operations.reset',
    expectedSign: 'either',
  },
  ADJUST: {
    variant: 'outline',
    className: 'border-muted-foreground/40 text-muted-foreground',
    labelKey: 'adminOrganizations.quotaTransactions.operations.adjust',
    expectedSign: 'either',
  },
};

const formatAmount = (amount: number | null, operationType: string | null) => {
  if (amount === null || amount === undefined) return '-';
  // CONSUME / ALLOCATE store positive deltas but mean opposite things; REFUND is negative.
  // For display we surface a +/- relative to the quota's remaining balance.
  if (operationType === 'CONSUME') return `-${amount}`;
  if (operationType === 'ALLOCATE') return `+${amount}`;
  if (operationType === 'REFUND') return `+${Math.abs(amount)}`;
  // RESET / ADJUST may be either direction.
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${Math.abs(amount)}`;
};

const amountToneClass = (amount: number | null, operationType: string | null) => {
  if (amount === null || amount === undefined) return 'text-muted-foreground';
  if (operationType === 'CONSUME') return 'text-destructive';
  if (operationType === 'ALLOCATE' || operationType === 'REFUND')
    return 'text-green-700';
  return '';
};

export function useOrganizationQuotaTransactionsColumns(): ColumnDef<ReadQuotaTransaction>[] {
  const { t } = useTranslation();
  return [
    {
      accessorKey: 'operationType',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotaTransactions.columns.operation')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('operationType') as string | null;
        const style = value ? OPERATION_STYLE[value] : undefined;
        if (!value) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge
            variant={style?.variant ?? 'outline'}
            className={cn('capitalize', style?.className)}
          >
            {style ? t(style.labelKey) : value.toLowerCase()}
          </Badge>
        );
      },
      filterFn: 'equals',
      enableSorting: false,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotaTransactions.columns.amount')} />
      ),
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number | null;
        const operationType = row.original.operationType;
        return (
          <div
            className={cn(
              'text-right tabular-nums font-medium',
              amountToneClass(amount, operationType),
            )}
          >
            {formatAmount(amount, operationType)}
          </div>
        );
      },
      meta: { className: 'text-right' },
      enableSorting: false,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotaTransactions.columns.description')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('description') as string | null;
        return value ? (
          <LongText className="max-w-96 text-muted-foreground">
            {value}
          </LongText>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      enableSorting: false,
    },
    {
      id: 'reference',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotaTransactions.columns.reference')} />
      ),
      cell: ({ row }) => {
        const { referenceType, referenceId } = row.original;
        if (!referenceType && !referenceId)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-col">
            {referenceType ? (
              <span className="capitalize">{referenceType}</span>
            ) : null}
            {referenceId ? (
              <span className="text-xs text-muted-foreground truncate max-w-48">
                {referenceId}
              </span>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <CollectionColumnHeader column={column} title={t('adminOrganizations.quotaTransactions.columns.created')} />
      ),
      cell: ({ row }) => {
        const value = row.getValue('createdAt') as string | null;
        return (
          <div className="text-muted-foreground tabular-nums">
            {value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'}
          </div>
        );
      },
    },
  ];
}
