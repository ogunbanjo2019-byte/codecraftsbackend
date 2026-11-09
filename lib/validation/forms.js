import { z } from 'zod';

const name = z.string().trim().min(2).max(120);
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const optionalText = (max) =>
  z.string().trim().max(max).optional().or(z.literal(''));

export const projectSchema = z.object({
  full_name: name,
  email,
  phone: optionalText(40),
  company: optionalText(160),
  service_required: z.enum([
    'Website',
    'Mobile App',
    'Web Application',
    'Software/SaaS',
    'UI/UX',
    'AI & Automation',
    'Digital Marketing',
    'Technology Consulting',
    'Training',
    'Other',
  ]),
  description: z.string().trim().min(10).max(5000),
  budget_range: z
    .enum([
      'Below ₦100k',
      '₦100k–₦250k',
      '₦250k–₦500k',
      '₦500k–₦1m',
      '₦1m+',
      'Not sure yet',
    ])
    .optional(),
  timeline: optionalText(120),
  consent: z.literal(true),
});

export const contactSchema = z.object({
  full_name: name,
  email,
  phone: optionalText(40),
  company: optionalText(160),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(5000),
  website: z.string().optional(),
});

export const newsletterSchema = z.object({ email });
