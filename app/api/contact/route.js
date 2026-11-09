import { contactSchema } from '@/lib/validation/forms';
import { submitForm } from '@/lib/http/public-form';
import { ok, fail } from '@/lib/http/responses';
export async function POST(req) {
  const r = await submitForm(req, contactSchema, 'contact_messages', {
    honeypot: 'website',
    map: ({ website, ...v }) => ({ ...v, status: 'unread' }),
  });
  return r.success
    ? ok({ received: true }, r.message, r.status)
    : fail(r.message, r.status, r.errors);
}
