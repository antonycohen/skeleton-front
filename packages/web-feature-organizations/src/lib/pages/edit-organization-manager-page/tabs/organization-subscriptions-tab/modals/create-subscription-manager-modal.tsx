import { useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@skeleton/web-components';
import {
  useCreateSubscription,
  useGetCustomerByOrganizationId,
  useGetOrganizationMembers,
  useGetPrices,
  useGetProducts,
} from '@skeleton/core-api';
import { CreatePrice, OrganizationType, ReadPrice } from '@skeleton/core-api-models';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { TFunction, useTranslation } from '@skeleton/core-translations';
import { useCreateSubscriptionPriceForm } from '../hooks/use-create-subscription-price-form';

type CreateSubscriptionManagerModalProps = {
  organizationId: string;
  organizationName?: string | null;
  organizationType?: OrganizationType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatPriceLabel = (price: ReadPrice, t: TFunction) => {
  const name =
    price.nickname || price.lookupKey || price.id || t('adminOrganizations.subscriptions.create.unnamedPrice');
  const amount =
    price.unitAmountInCents != null
      ? `${(price.unitAmountInCents / 100).toFixed(2)} ${price.currency?.toUpperCase() ?? ''}`
      : null;
  const interval = price.recurringInterval ? `/${price.recurringInterval}` : '';
  const tag = price.organizationType ? ` · ${price.organizationType}` : '';
  return amount ? `${name} — ${amount}${interval}${tag}` : `${name}${tag}`;
};

/**
 * Super admin: creates a subscription for the displayed workspace's payment
 * customer. The flow is "pick an existing price or create a new one, then
 * create the subscription" — Stripe then emails the invoice to the customer
 * (collection_method=send_invoice).
 */
export const CreateSubscriptionManagerModal = ({
  organizationId,
  organizationName,
  organizationType,
  open,
  onOpenChange,
}: CreateSubscriptionManagerModalProps) => {
  const { t } = useTranslation();
  const [priceMode, setPriceMode] = useState<'existing' | 'new'>('existing');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPrice, setSelectedPrice] = useState<ReadPrice | null>(null);
  const [daysUntilDue, setDaysUntilDue] = useState('30');
  // null = untouched, so the admin-member prefill applies once loaded; any
  // edit (including clearing the field) sticks.
  const [emailOverride, setEmailOverride] = useState<string | null>(null);

  // The API has no organization filter on customers: the query pages through
  // the whole collection and matches on the nested organization id.
  const { data: customer, isLoading: isLoadingCustomers } =
    useGetCustomerByOrganizationId(organizationId, { enabled: open });

  // Prefill the billing email with a workspace admin's, invited members
  // included ("invited" = not yet confirmed).
  const { data: membersData } = useGetOrganizationMembers(
    {
      staticParams: { organizationId },
      filters: { role: 'admin' },
      fields: {
        id: null,
        email: null,
        role: null,
        status: null,
        user: { fields: { id: null, email: null } },
      },
      limit: 100,
      offset: 0,
    },
    { enabled: open },
  );
  const adminEmail = useMemo(() => {
    // Allowlist over blocklist: keeps out suspended members and any status the
    // API may add later (e.g. deleted).
    const adminEmails = (membersData?.data ?? [])
      .filter(
        (member) =>
          member.role === 'admin' &&
          (member.status === 'invited' || member.status === 'accepted'),
      )
      .map((member) => member.email ?? member.user?.email ?? '')
      .filter((memberEmail) => memberEmail !== '');
    // Multiple admins: any of them works — take the first, an arbitrary but
    // repeatable choice; the super admin can change it before submitting.
    return adminEmails[0] ?? '';
  }, [membersData]);
  const email = emailOverride ?? adminEmail;

  // Prices are picked per product to keep the list short.
  const { data: pricesData } = useGetPrices(
    {
      fields: {
        id: null,
        nickname: null,
        lookupKey: null,
        currency: null,
        unitAmountInCents: null,
        recurringInterval: null,
        organizationType: null,
        product: { fields: { id: null, name: null } },
      },
      staticParams: {
        productId: selectedProductId,
      },
      limit: 100,
      offset: 0,
    },
    { enabled: open && selectedProductId !== '' },
  );
  const prices = pricesData?.data ?? [];

  const { data: productsData } = useGetProducts(
    { fields: { id: null, name: null }, limit: 100, offset: 0 },
    { enabled: open },
  );
  const products = productsData?.data ?? [];

  const priceForm = useCreateSubscriptionPriceForm({
    organizationType,
    onSuccess: (price, submitted) => {
      // The create response may omit the nested product: fall back to the
      // product the form submitted so the price list shows the new price.
      setSelectedProductId(price.product?.id ?? submitted.product.id);
      setSelectedPrice(price);
      setPriceMode('existing');
    },
  });
  const { ControlledTextInput, ControlledSelectInput, ControlledNumberInput } =
    createConnectedInputHelpers<CreatePrice>();

  const createSubscription = useCreateSubscription({
    onSuccess: () => {
      toast.success(t('adminOrganizations.subscriptions.create.created'));
      handleOpenChange(false);
    },
    onError: (error) =>
      toast.error(error.message || t('adminOrganizations.subscriptions.create.failed')),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPriceMode('existing');
      setSelectedProductId('');
      setSelectedPrice(null);
      setDaysUntilDue('30');
      setEmailOverride(null);
      priceForm.reset();
    }
    onOpenChange(nextOpen);
  };

  // Empty means "let the backend pick its default"; anything else must be a
  // positive number (createSubscriptionSchema requires .positive()).
  const parsedDaysUntilDue = Number.parseInt(daysUntilDue, 10);
  const isDaysUntilDueInvalid =
    daysUntilDue.trim() !== '' && !(parsedDaysUntilDue >= 1);

  const handleCreateSubscription = () => {
    if (!customer?.id || !selectedPrice?.id || !email || isDaysUntilDueInvalid) return;
    createSubscription.mutate({
      customerId: customer.id,
      priceIds: [selectedPrice.id],
      email,
      daysUntilDue: daysUntilDue.trim() === '' ? undefined : parsedDaysUntilDue,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('adminOrganizations.subscriptions.create.title')}</DialogTitle>
          <DialogDescription>
            {t('adminOrganizations.subscriptions.create.description', {
              workspace: organizationName ?? t('adminOrganizations.subscriptions.create.thisWorkspace'),
            })}
          </DialogDescription>
        </DialogHeader>

        {!isLoadingCustomers && !customer && (
          <p className="text-sm text-destructive">
            {t('adminOrganizations.subscriptions.create.noCustomer')}
          </p>
        )}

        <Tabs
          value={priceMode}
          onValueChange={(value) => setPriceMode(value as 'existing' | 'new')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">
              {t('adminOrganizations.subscriptions.create.existingPrice')}
            </TabsTrigger>
            <TabsTrigger value="new">{t('adminOrganizations.subscriptions.create.newPrice')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {priceMode === 'existing' ? (
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel>{t('adminOrganizations.subscriptions.create.product')}</FieldLabel>
              <Select
                value={selectedProductId}
                onValueChange={(productId) => {
                  setSelectedProductId(productId);
                  // A previously picked price no longer matches the product.
                  if (selectedPrice && selectedPrice.product?.id !== productId) {
                    setSelectedPrice(null);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('adminOrganizations.subscriptions.create.selectProduct')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) =>
                    product.id ? (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name ?? product.id}
                      </SelectItem>
                    ) : null,
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>{t('adminOrganizations.subscriptions.create.price')}</FieldLabel>
              <Select
                disabled={!selectedProductId}
                value={selectedPrice?.id ?? ''}
                onValueChange={(priceId) =>
                  setSelectedPrice(prices.find((price) => price.id === priceId) ?? selectedPrice)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedProductId
                        ? t('adminOrganizations.subscriptions.create.selectPrice')
                        : t('adminOrganizations.subscriptions.create.selectProductFirst')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {/* A price just created from the "New price" tab may not be in the list yet. */}
                  {selectedPrice?.id && !prices.some((price) => price.id === selectedPrice.id) && (
                    <SelectItem value={selectedPrice.id}>
                      {formatPriceLabel(selectedPrice, t)}
                    </SelectItem>
                  )}
                  {prices.map((price) =>
                    price.id ? (
                      <SelectItem key={price.id} value={price.id}>
                        {formatPriceLabel(price, t)}
                      </SelectItem>
                    ) : null,
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>{t('adminOrganizations.subscriptions.create.billingEmail')}</FieldLabel>
              <Input
                type="email"
                placeholder="billing@company.example"
                value={email}
                onChange={(event) => setEmailOverride(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('adminOrganizations.subscriptions.create.billingEmailHint')}
              </p>
            </Field>

            <Field data-invalid={isDaysUntilDueInvalid}>
              <FieldLabel>{t('adminOrganizations.subscriptions.create.daysUntilDue')}</FieldLabel>
              <Input
                type="number"
                min={1}
                step={1}
                value={daysUntilDue}
                onChange={(event) => setDaysUntilDue(event.target.value)}
              />
              {isDaysUntilDueInvalid && (
                <FieldError>{t('adminOrganizations.subscriptions.create.daysUntilDueInvalid')}</FieldError>
              )}
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleCreateSubscription}
                disabled={!customer?.id || !selectedPrice?.id || !email || isDaysUntilDueInvalid}
                isLoading={createSubscription.isPending}
              >
                {t('adminOrganizations.subscriptions.createAction')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <FormProvider {...priceForm.form}>
            <form onSubmit={priceForm.handleSubmit} className="flex flex-col gap-4">
              <ControlledSelectInput
                name="product.id"
                label={t('adminOrganizations.subscriptions.create.product')}
                placeholder={t('adminOrganizations.subscriptions.create.selectProduct')}
                options={products
                  .filter((product) => product.id)
                  .map((product) => ({
                    value: product.id as string,
                    label: product.name ?? (product.id as string),
                  }))}
              />
              <ControlledTextInput
                name="nickname"
                label={t('adminOrganizations.subscriptions.create.nickname')}
                placeholder={t('adminOrganizations.subscriptions.create.nicknamePlaceholder')}
              />
              <ControlledTextInput
                name="lookupKey"
                label={t('adminOrganizations.subscriptions.create.lookupKey')}
                placeholder="e.g. business_monthly"
              />
              <ControlledSelectInput
                name="currency"
                label={t('adminOrganizations.subscriptions.create.currency')}
                options={[
                  { value: 'eur', label: 'EUR' },
                  { value: 'usd', label: 'USD' },
                ]}
              />
              <ControlledNumberInput
                name="unitAmountInCents"
                label={t('adminOrganizations.subscriptions.create.unitAmount')}
                min={0}
                step={1}
                placeholder="0"
              />
              <ControlledSelectInput
                name="recurringInterval"
                label={t('adminOrganizations.subscriptions.create.recurringInterval')}
                options={[
                  { value: 'month', label: t('common.month') },
                  { value: 'year', label: t('common.year') },
                ]}
              />
              <ControlledSelectInput
                name="organizationType"
                label={t('adminOrganizations.subscriptions.create.organizationType')}
                description={t('adminOrganizations.subscriptions.create.organizationTypeHint')}
                options={[
                  { value: 'business', label: t('adminOrganizations.types.business') },
                  { value: 'individual', label: t('adminOrganizations.types.individual') },
                ]}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" isLoading={priceForm.isCreating}>
                  {t('adminOrganizations.subscriptions.create.createPrice')}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
};
