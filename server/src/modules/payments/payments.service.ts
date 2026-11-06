import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { paymentsRepository } from './payments.repository';
import { chargilyProvider } from './chargilyProvider';
import { InitiateCheckoutInput } from './payments.validation';

function requireConfigured() {
  if (!env.CHARGILY_API_KEY) {
    throw new AppError(
      'Payments are not configured on this server yet (missing CHARGILY_API_KEY).',
      503,
      'PAYMENTS_NOT_CONFIGURED'
    );
  }
}

export const paymentsService = {
  async initiateCheckout(studentId: string, courseId: string, input: InitiateCheckoutInput) {
    requireConfigured();

    const course = await paymentsRepository.findCourse(courseId);
    if (!course) throw AppError.notFound('Course not found');

    if (course.is_free) {
      throw new AppError('This course is free — use the enroll endpoint instead.', 400, 'BAD_REQUEST');
    }

    const existingEnrollment = await paymentsRepository.findExistingEnrollment(studentId, courseId);
    if (existingEnrollment) throw AppError.conflict('Already enrolled in this course');

    const payment = await paymentsRepository.create({
      studentId,
      courseId,
      amount: Number(course.price),
      currency: 'dzd',
      provider: 'chargily',
    });

    const successUrl = `${env.CLIENT_URL}/payment/result?courseId=${courseId}&status=success`;
    const failureUrl = `${env.CLIENT_URL}/payment/result?courseId=${courseId}&status=failure`;

    const checkout = await chargilyProvider.createCheckout({
      amount: Number(course.price),
      currency: 'dzd',
      successUrl,
      failureUrl,
      paymentMethod: input.paymentMethod,
      metadata: { paymentId: payment.id, courseId, studentId },
    });

    await paymentsRepository.setProviderReference(payment.id, checkout.providerReference, {
      paymentMethod: input.paymentMethod,
    });

    return { checkoutUrl: checkout.checkoutUrl };
  },

  /**
   * Handles the raw webhook body. Never trusts the browser redirect as proof
   * of payment — this server-to-server call, with a verified signature, is
   * the only thing that ever marks a payment completed and creates the
   * enrollment.
   */
  async handleWebhook(rawBody: Buffer, signatureHeader: string | undefined) {
    requireConfigured();

    const isValid = chargilyProvider.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      throw AppError.unauthorized('Invalid webhook signature');
    }

    const event = chargilyProvider.parseWebhookEvent(rawBody);

    const payment = await paymentsRepository.findByProviderReference(event.providerReference);
    if (!payment) {
      // Nothing we recognize — acknowledge anyway so the provider stops retrying.
      return;
    }

    if (event.status === 'paid') {
      await paymentsRepository.markStatus(payment.id, 'completed');
      await paymentsRepository.createEnrollment(payment.student_id, payment.course_id);
    } else if (event.status === 'failed') {
      await paymentsRepository.markStatus(payment.id, 'failed');
    }
    // 'pending'/'unknown' events are acknowledged but don't change our state.
  },
};
