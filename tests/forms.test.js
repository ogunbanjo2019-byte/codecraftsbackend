import { describe, expect, it } from 'vitest';
import {
  contactSchema,
  newsletterSchema,
  projectSchema,
} from '../lib/validation/forms.js';

describe('server form validation', () => {
  it('normalizes project email and accepts the contract request fields', () => {
    const result = projectSchema.safeParse({
      full_name: ' Ada Lovelace ',
      email: 'ADA@EXAMPLE.COM',
      service_required: 'Website',
      description: 'Build a corporate website',
      consent: true,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('ada@example.com');
  });

  it('rejects an invalid project and missing consent', () => {
    expect(
      projectSchema.safeParse({
        full_name: 'A',
        email: 'bad',
        service_required: 'Unknown',
        description: 'x',
        consent: false,
      }).success,
    ).toBe(false);
  });

  it('normalizes newsletter email', () => {
    expect(newsletterSchema.parse({ email: '  TEST@Example.com ' }).email).toBe(
      'test@example.com',
    );
  });

  it('requires a meaningful contact message and subject', () => {
    expect(
      contactSchema.safeParse({
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello',
        message: 'A real question',
      }).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse({
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'A real question',
      }).success,
    ).toBe(false);
  });
});
