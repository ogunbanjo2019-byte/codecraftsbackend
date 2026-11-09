import { newsletterSchema } from '@/lib/validation/forms';
import { submitForm } from '@/lib/http/public-form';
import { ok, fail } from '@/lib/http/responses';
export async function POST(req) {
  const r = await submitForm(
    req,
    newsletterSchema,
    'newsletter_subscribers',
    {},
  );
  return r.success
    ? ok({ subscribed: true }, r.message, r.status)
    : fail(r.message, r.status, r.errors);
}
