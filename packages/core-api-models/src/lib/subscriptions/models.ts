import * as z from 'zod';
import {priceRefSchema, readPriceSchema} from '../prices';
import {productGroupSchema} from "../product-groups";

// Enums
export const subscriptionStatus = z.enum([
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused',
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatus>;

export const collectionMethod = z.enum(['charge_automatically', 'send_invoice']);
export type CollectionMethod = z.infer<typeof collectionMethod>;

export const invoiceStatus = z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']);
export type InvoiceStatus = z.infer<typeof invoiceStatus>;

// Invoice schema
// Read-only: invoices are synchronized from Stripe and exposed only through the
// subscription (latestInvoice) - there is no invoice REST endpoint.
export const readInvoiceSchema = z.object({
  id: z.string().nullable(),
  status: invoiceStatus.nullable(),
  amountDue: z.number().nullable(),
  amountPaid: z.number().nullable(),
  amountRemaining: z.number().nullable(),
  currency: z.string().nullable(),
  hostedInvoiceUrl: z.string().nullable(),
  invoicePdf: z.string().nullable(),
  dueDate: z.iso.datetime().nullable(),
  paidAt: z.iso.datetime().nullable(),
  number: z.string().nullable(),
  collectionMethod: collectionMethod.nullable(),
  subscriptionId: z.string().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadInvoice = z.infer<typeof readInvoiceSchema>;

// SubscriptionItem schemas
// 1. Reference schema with label field (for dropdowns, selects, links)
export const readSubscriptionItemRefSchema = z.object({
  id: z.string(),
  quantity: z.number().nullable(),
});
export type ReadSubscriptionItemRef = z.infer<typeof readSubscriptionItemRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const subscriptionItemRefSchema = z.object({
  id: z.string(),
});
export type SubscriptionItemRef = z.infer<typeof subscriptionItemRefSchema>;

// 3. Read schema for subscription item - all properties nullable (API response)
export const readSubscriptionItemSchema = z.object({
  id: z.string().nullable(),
  price: readPriceSchema.nullable(),
  quantity: z.number().nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadSubscriptionItem = z.infer<typeof readSubscriptionItemSchema>;

// 4. Create schema for subscription item
export const createSubscriptionItemSchema = z.object({
  price: priceRefSchema,
  quantity: z.number().positive('validation.subscription.quantityPositive').optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});
export type CreateSubscriptionItem = z.infer<typeof createSubscriptionItemSchema>;

// 5. Update schema for subscription item
export const updateSubscriptionItemSchema = createSubscriptionItemSchema.partial();
export type UpdateSubscriptionItem = z.infer<typeof updateSubscriptionItemSchema>;

// Subscription schemas
// 1. Reference schema with label field (for dropdowns, selects, links)
export const readSubscriptionRefSchema = z.object({
  id: z.string(),
  status: subscriptionStatus,
});
export type ReadSubscriptionRef = z.infer<typeof readSubscriptionRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const subscriptionRefSchema = z.object({
  id: z.string(),
});
export type SubscriptionRef = z.infer<typeof subscriptionRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readSubscriptionSchema = z.object({
  id: z.string().nullable(),
  status: subscriptionStatus.nullable(),
  currentPeriodStart: z.iso.datetime().nullable(),
  currentPeriodEnd: z.iso.datetime().nullable(),
  cancelAtPeriodEnd: z.boolean().nullable(),
  canceledAt: z.iso.datetime().nullable(),
  cancelAt: z.iso.datetime().nullable(),
  endedAt: z.iso.datetime().nullable(),
  startDate: z.iso.datetime().nullable(),
  trialStart: z.iso.datetime().nullable(),
  trialEnd: z.iso.datetime().nullable(),
  collectionMethod: collectionMethod.nullable(),
  defaultPaymentMethodId: z.string().nullable(),
  latestInvoiceId: z.string().nullable(),
  currency: z.string().nullable(),
  description: z.string().nullable(),
  daysUntilDue: z.number().nullable(),
  items: z.array(readSubscriptionItemSchema).nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
  productGroup: z.lazy(() => productGroupSchema).nullable(),
  latestInvoice: readInvoiceSchema.nullable(),
  organizationId: z.string().nullable(),
  // The organization owning the subscription. When a child organization is covered by its
  // parent's subscription, the API restricts this to `name` only (no id) - use
  // `organizationId` to compare against the organization being displayed.
  organization: z
    .object({
      id: z.string().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
});
export type ReadSubscription = z.infer<typeof readSubscriptionSchema>;

// 4. Create schema - super admin flow: the subscription is created with
// collection_method=send_invoice (Stripe emails the customer an invoice to pay).
export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'validation.subscription.customerRequired'),
  priceIds: z.array(z.string().min(1)).min(1, 'validation.subscription.pricesRequired'),
  // Billing email pushed to the customer before the subscription is created:
  // Stripe refuses send_invoice subscriptions for customers without a valid email.
  email: z.email('validation.subscription.emailInvalid'),
  daysUntilDue: z
    .number()
    .positive('validation.subscription.daysUntilDuePositive')
    .optional(),
});
export type CreateSubscription = z.infer<typeof createSubscriptionSchema>;

// Legacy export for backward compatibility
export const subscriptionSchema = readSubscriptionSchema;
export type Subscription = ReadSubscription;

export const subscriptionItemSchema = readSubscriptionItemSchema;
export type SubscriptionItem = ReadSubscriptionItem;
