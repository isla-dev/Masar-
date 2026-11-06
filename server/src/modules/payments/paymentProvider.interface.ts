export interface CreateCheckoutParams {
  amount: number; // whole currency units (e.g. DZD, not centimes)
  currency: string; // ISO-ish lowercase code, e.g. 'dzd'
  successUrl: string;
  failureUrl: string;
  /** Provider-specific payment method hint, e.g. 'cib' | 'edahabia'. Optional — providers that don't support this ignore it. */
  paymentMethod?: string;
  locale?: 'en' | 'fr' | 'ar';
  metadata: Record<string, string>;
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerReference: string; // the provider's own id for this checkout/transaction
}

export type WebhookEventStatus = 'paid' | 'failed' | 'pending' | 'unknown';

export interface ParsedWebhookEvent {
  providerReference: string;
  status: WebhookEventStatus;
  metadata: Record<string, string>;
}

/**
 * Every payment provider (Chargily today; Stripe, a different Algerian
 * aggregator, etc. later) implements this. Nothing outside this module
 * should ever import a provider SDK directly — only this interface.
 */
export interface PaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  /** Verifies the webhook request is genuinely from the provider, using the raw request body bytes. */
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean;
  parseWebhookEvent(rawBody: Buffer): ParsedWebhookEvent;
}
