import { randomUUID, createHash } from 'node:crypto';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { firestore, FieldValue } from '@/lib/firebase/admin';
export async function submitForm(req, schema, collection, opts = {}) {
  const rl = rateLimit(`${collection}:${clientIp(req)}`);
  if (!rl.allowed)
    return {
      success: false,
      message: 'Too many submissions. Please try again later.',
      status: 429,
    };
  let body;
  try {
    body = await req.json();
  } catch {
    return { success: false, message: 'Invalid JSON request', status: 400 };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const errors = {};
    for (const issue of parsed.error.issues)
      errors[String(issue.path[0] ?? '_')] = issue.message;
    return {
      success: false,
      message: 'Please check the submitted fields',
      status: 400,
      errors,
    };
  }
  if (opts.honeypot && parsed.data[opts.honeypot])
    return { success: false, message: 'Submission rejected', status: 400 };
  try {
    const db = firestore(),
      value = opts.map ? opts.map(parsed.data) : parsed.data;
    const now = FieldValue.serverTimestamp();
    let docRef;
    if (collection === 'newsletter_subscribers') {
      const email = parsed.data.email;
      const id = createHash('sha256').update(email).digest('hex');
      docRef = db.collection(collection).doc(id);
      try {
        await docRef.create({
          ...value,
          email,
          status: 'subscribed',
          subscribed_at: now,
          created_at: now,
        });
      } catch (e) {
        if (e.code === 6 || e.code === 'already-exists')
          return {
            success: true,
            data: { subscribed: true },
            message: 'Subscription received',
            status: 200,
          };
        throw e;
      }
    } else {
      docRef = db.collection(collection).doc();
      await docRef.set({
        ...value,
        id: docRef.id,
        created_at: now,
        updated_at: now,
      });
    }
    const saved = await docRef.get();
    return {
      success: true,
      data:
        collection === 'project_requests'
          ? { id: docRef.id, reference_no: saved.get('reference_no') }
          : { id: docRef.id },
      message: 'Submitted successfully',
      status: 201,
    };
  } catch (e) {
    console.error('Firebase form write failed', e.code || 'configuration');
    return {
      success: false,
      message: 'Unable to save your submission right now',
      status: 503,
    };
  }
}
