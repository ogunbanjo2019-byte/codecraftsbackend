import { projectSchema } from '@/lib/validation/forms';
import { submitForm } from '@/lib/http/public-form';
import { ok, fail } from '@/lib/http/responses';
import { randomUUID } from 'node:crypto';
export async function POST(req) {
  const r = await submitForm(req, projectSchema, 'project_requests', {
    map: (v) => ({
      ...v,
      reference_no: `CC-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: 'new',
    }),
  });
  return r.success
    ? ok(r.data, r.message, r.status)
    : fail(r.message, r.status, r.errors);
}
