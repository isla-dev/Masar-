import { ChargilyClient, verifySignature } from '@chargily/chargily-pay';
import { env } from '../../config/env';
import {
  CheckoutResult,
  CreateCheckoutParams,
  ParsedWebhookEvent,
  PaymentProvider,
} from './paymentProvider.interface';

const client = new ChargilyClient({
  api_key: env.CHARGILY_API_KEY,
  mode: env.CHARGILY_MODE, // 'test' | 'live'
});

export const chargilyProvider: PaymentProvider = {
  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    // Chargily supports creating a checkout directly from an amount + currency,
    // without pre-registering a Product/Price — the right fit here, since course
    // prices change over time and we always want to charge the current price.
    const checkout = await client.createCheckout({
      amount: params.amount,
      currency: params.currency,
      success_url: params.successUrl,
      failure_url: params.failureUrl,
      payment_method: params.paymentMethod, // 'cib' | 'edahabia'
      locale: params.locale ?? 'en',
      metadata: params.metadata,
    } as any); // the JS SDK's TS types lag behind its documented amount-based checkout mode

    return {
      checkoutUrl: (checkout as any).checkout_url,
      providerReference: (checkout as any).id,
    };
  },

  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;
    try {
      return verifySignature(rawBody, signatureHeader, env.CHARGILY_API_KEY);
    } catch {
      return false;
    }
  },

  parseWebhookEvent(rawBody: Buffer): ParsedWebhookEvent {
    const event = JSON.parse(rawBody.toString('utf-8'));
    const data = event.data ?? {};

    let status: ParsedWebhookEvent['status'] = 'unknown';
    if (event.type === 'checkout.paid') status = 'paid';
    else if (event.type === 'checkout.failed') status = 'failed';
    else if (event.type === 'checkout.pending') status = 'pending';

    return {
      providerReference: data.id,
      status,
      metadata: data.metadata ?? {},
    };
  },
};
