import { AlertTriangle } from 'lucide-react';
import { Button } from '@skeleton/web-components';
import { useCurrentOrganization } from '@skeleton/core-workspace';
import { useTranslation } from '@skeleton/core-translations';
import { formatAmount } from '../utils/format-amount';

/**
 * Warns when the latest open subscription invoice is past its due date, with a
 * link to the Stripe-hosted payment page. Informative only: the service keeps
 * working while the invoice is unpaid.
 */
export function PastDueInvoiceBanner() {
  const { t } = useTranslation();
  const organization = useCurrentOrganization();
  const invoice = organization?.subscription?.latestInvoice;

  if (invoice?.status !== 'open' || invoice.dueDate == null) return null;
  if (new Date(invoice.dueDate) >= new Date()) return null;

  const amountInCents = invoice.amountRemaining ?? invoice.amountDue;
  const amount =
    amountInCents != null
      ? formatAmount(amountInCents, invoice.currency ?? 'eur')
      : null;
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          {amount
            ? t('billing.pastDueBanner.messageWithAmount', { amount, dueDate })
            : t('billing.pastDueBanner.message', { dueDate })}
        </span>
      </div>
      {invoice.hostedInvoiceUrl && (
        <Button size="sm" asChild>
          <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
            {t('billing.pastDueBanner.payInvoice')}
          </a>
        </Button>
      )}
    </div>
  );
}
